#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
#
#  Copyright 2002  The FreeRADIUS server project
#  Copyright 2002  Boian Jordanov <bjordanov@orbitel.bg>
#

#
# Example code for use with rlm_perl
#
# You can use every module that comes with your perl distribution!
#
#KG
#For fast transition hash calculations, used this repository as a reference:
#https://github.com/DarkWolf-Labs/ft-crack

use strict;
use warnings;
use v5.10; # for say() function

use DBI;
use Data::Dumper;
use DateTime;

use Digest::HMAC_SHA1 qw(hmac_sha1);
use Digest::SHA qw(sha1);
#use Crypt::PBKDF2;
#use Crypt::OpenSSL::FASTPBKDF2 qw/fastpbkdf2_hmac_sha1 fastpbkdf2_hmac_sha256 fastpbkdf2_hmac_sha512/;
#FT Modules
use Digest::SHA qw(hmac_sha256);
use Digest::CMAC;
use Math::Round;

use threads;
use Thread::Queue;

use vars qw(    
    %RAD_REQUEST 
    %RAD_CHECK 
    %RAD_REPLY 
    %RAD_CONFIG 
    $dbh 
    %conf
    $conn_valid
    $return
    $stmt_realm_id 
    $stmt_ssid_id 
    $stmt_pmk_list
    $stmt_password
);

# This is hash wich hold original request from radius
#my %RAD_REQUEST;
# In this hash you add values that will be returned to NAS.
#my %RAD_REPLY;
#This is for check items
#my %RAD_CHECK;

#
# This the remapping of return values
#
use constant    RLM_MODULE_REJECT=>    0;#  /* immediately reject the request */
use constant    RLM_MODULE_FAIL=>      1;#  /* module failed, don't reply */
use constant    RLM_MODULE_OK=>        2;#  /* the module is OK, continue */
use constant    RLM_MODULE_HANDLED=>   3;#  /* the module handled the request, so stop. */
use constant    RLM_MODULE_INVALID=>   4;#  /* the module considers the request invalid. */
use constant    RLM_MODULE_USERLOCK=>  5;#  /* reject the request (user is locked out) */
use constant    RLM_MODULE_NOTFOUND=>  6;#  /* user not found */
use constant    RLM_MODULE_NOOP=>      7;#  /* module succeeded without doing anything */
use constant    RLM_MODULE_UPDATED=>   8;#  /* OK (pairs modified) */
use constant    RLM_MODULE_NUMCODES=>  9;#  /* How many return codes there are */



#
# This the RADIUS log type
#  
use constant    RAD_LOG_DEBUG=>  0; 
use constant    RAD_LOG_AUTH=>   1; 
use constant    RAD_LOG_PROXY=>  2; 
use constant    RAD_LOG_INFO=>   3; 
use constant    RAD_LOG_ERROR=>  4; 

#
# This is the WPA Key Data Tag
#
use constant    TAG_MOBILITY_DOMAIN     =>  54;
use constant    TAG_FAST_BSS_TRANSITION =>  55;
use constant    PMK_R1_KEY_HOLDER_ID    =>  1;
use constant    PMK_R0_KEY_HOLDER_ID    =>  3;


#___ RADIUSdesk _______
sub read_conf {
   $conf{'db_name'}     = $ENV{RD_DB_NAME} || "rd";
   $conf{'db_host'}     = $ENV{RD_DB_SERVER} || "rdmariadb";
   $conf{'db_user'}     = $ENV{RD_DB_USERNAME} || "rd";
   $conf{'db_passwd'}   = $ENV{RD_DB_PASSWORD} || "rd";
}

sub conn_db {
    $dbh->disconnect() if defined $dbh;
    # $dbh = DBI->connect("DBI:mysql:database=radius;host=localhost","radius","radius_pwd");
    $dbh = DBI->connect("DBI:mysql:database=$conf{'db_name'};host=$conf{'db_host'}",
                        $conf{'db_user'},
                        $conf{'db_passwd'});
    if ($DBI::err) {
        &radiusd::radlog(RAD_LOG_ERROR, "DB Connect Error. $DBI::errstr");
    } else {
        
        $stmt_realm_id  = $dbh->prepare(q{
            SELECT realms.id AS id FROM dynamic_clients 
            LEFT JOIN dynamic_client_realms ON dynamic_clients.id=dynamic_client_realms.dynamic_client_id 
            LEFT JOIN realms ON realms.id=dynamic_client_realms.realm_id 
            WHERE dynamic_clients.nasidentifier=? 
            AND dynamic_clients.type='private_psk'
         });
         
        $stmt_ssid_id  = $dbh->prepare(q{
            SELECT id FROM realm_ssids WHERE name=? AND realm_id=?
        });
         
         $stmt_pmk_list  = $dbh->prepare(q{
            SELECT permanent_users.username,permanent_users.session_limit,active,realm_vlans.vlan,realm_pmks.pmk,realm_pmks.ppsk from permanent_users 
            LEFT JOIN realm_vlans ON realm_vlans.id=permanent_users.realm_vlan_id 
            INNER JOIN realm_pmks ON realm_pmks.ppsk=permanent_users.ppsk AND realm_pmks.realm_ssid_id=? 
            WHERE permanent_users.realm_id=?;
        });
        
        $stmt_password  = $dbh->prepare(q{
            SELECT value FROM radcheck WHERE username=? AND attribute='Cleartext-Password'
        });
           
    }
    $conn_valid = (! $DBI::err);
}


sub CLONE {
    read_conf();
    conn_db();
}


# Function to handle authorize
sub authorize {
    # For debugging purposes only
#       &log_request_attributes;
  
    &ppsk;

    return $return;
}

# Function to handle authenticate
sub authenticate {
    # For debugging purposes only
#       &log_request_attributes;

    if ($RAD_REQUEST{'User-Name'} =~ /^baduser/i) {
            # Reject user and tell him why
            $RAD_REPLY{'Reply-Message'} = "Denied access by rlm_perl function";
            return RLM_MODULE_REJECT;
    } else {
            # Accept user and set some attribute
            $RAD_REPLY{'h323-credit-amount'} = "100";
            return RLM_MODULE_OK;
    }
}

# Function to handle preacct
sub preacct {
    # For debugging purposes only
#       &log_request_attributes;

    $return = RLM_MODULE_OK;    
    return $return;
}

# Function to handle accounting
sub accounting {
    # For debugging purposes only
#       &log_request_attributes;

    # You can call another subroutine from here
    &test_call;

    return RLM_MODULE_OK;
}

# Function to handle checksimul
sub checksimul {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle pre_proxy
sub pre_proxy {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle post_proxy
sub post_proxy {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle post_auth
sub post_auth {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle xlat
sub xlat {
    # For debugging purposes only
#       &log_request_attributes;

    # Loads some external perl and evaluate it
    my ($filename,$a,$b,$c,$d) = @_;
    &radiusd::radlog(1, "From xlat $filename ");
    &radiusd::radlog(1,"From xlat $a $b $c $d ");
    local *FH;
    open FH, $filename or die "open '$filename' $!";
    local($/) = undef;
    my $sub = <FH>;
    close FH;
    my $eval = qq{ sub handler{ $sub;} };
    eval $eval;
    eval {main->handler;};
}

# Function to handle detach
sub detach {
    # For debugging purposes only
#       &log_request_attributes;

    # Do some logging.
    &radiusd::radlog(0,"rlm_perl::Detaching. Reloading. Done.");
}

#
# Some functions that can be called from other functions
#

sub test_call {
    # Some code goes here
    &radiusd::radlog(RAD_LOG_DEBUG,"Brannewyn het nie brieke nie");
}

sub log_request_attributes {
    # This shouldn't be done in production environments!
    # This is only meant for debugging!
    for (keys %RAD_REQUEST) {
            &radiusd::radlog(1, "RAD_REQUEST: $_ = $RAD_REQUEST{$_}");
    }
}

sub ppsk {

    my $FR_Anonce ='';
    my $FR_EAPoL_Key_Msg='';
    my $FR_Calling_Station='';
    if(($RAD_REQUEST{'Attr-245.26.11344.1'}||$RAD_REQUEST{'FreeRADIUS-802.1X-Anonce'})&&($RAD_REQUEST{'Attr-245.26.11344.2'}||$RAD_REQUEST{'FreeRADIUS-802.1X-EAPoL-Key-Msg'})){
        $FR_Anonce           = $RAD_REQUEST{'Attr-245.26.11344.1'} || $RAD_REQUEST{'FreeRADIUS-802.1X-Anonce'};
        $FR_EAPoL_Key_Msg    = $RAD_REQUEST{'Attr-245.26.11344.2'} || $RAD_REQUEST{'FreeRADIUS-802.1X-EAPoL-Key-Msg'};
	    $FR_Calling_Station  = $RAD_REQUEST{'Calling-Station-Id'};
		$FR_Anonce              =~ s/^0x//i;
		$FR_EAPoL_Key_Msg       =~ s/^0x//i;   
    }else{
        $RAD_REPLY{'Reply-Message'} = "Required Request Attributes Missing";
        $return = RLM_MODULE_REJECT;
        return;
    }

    my $ssid   = 0;
    my $ap_mac = 0;
    if(defined $RAD_REQUEST{'Called-Station-Id'} && length $RAD_REQUEST{'Called-Station-Id'} > 0) {
        if ($RAD_REQUEST{'Called-Station-Id'} =~ /(.+):(.+)/) {
            $ap_mac = $1;  # MAC
            $ssid   = $2;  # SSID
        }          
    }else{
        $RAD_REPLY{'Reply-Message'} = "Missing SSID in Called-Station-Id";
        $return = RLM_MODULE_REJECT;
        return;
    }
    
    #remove dashes from mac addresses
	$ap_mac =~ tr/-//d;
	my $sa_mac = $FR_Calling_Station;
	$sa_mac =~ tr/-//d;
    
    #Set EAPOL variables for processing
	my $EAPOL1 = a2b($FR_Anonce);
	my $EAPOL2 = a2b($FR_EAPoL_Key_Msg);

    if(defined $RAD_REQUEST{'NAS-Identifier'} && length $RAD_REQUEST{'NAS-Identifier'} > 0) {
    
        my $realm_id = 0;
        if ( ! $dbh->ping ) {
            CLONE();
        }
        $stmt_realm_id->execute($RAD_REQUEST{'NAS-Identifier'});     
        while(my $row = $stmt_realm_id->fetchrow_hashref()){        
            $realm_id = $row->{'id'};
        }
        $stmt_realm_id->finish();
        
        if(($ssid)&&($realm_id)){
            &radiusd::radlog("2", "Found Realm ID $realm_id and ssid $ssid. We can try to get the realm_ssid ID");
            
            #Get the realm_ssid id
            my $ssid_id = 0;
            $stmt_ssid_id->execute($ssid,$realm_id);        
            while(my $row = $stmt_ssid_id->fetchrow_hashref()){        
                $ssid_id = $row->{'id'};
            }
            $stmt_ssid_id->finish();
            
            if($ssid_id){
                &radiusd::radlog("2", "Found Realm ID $realm_id and ssid_id $ssid_id. We can try to get the LIST OF PPSKs");
                $stmt_pmk_list->execute($ssid_id,$realm_id); 
                my $match_found = 0;            
                while(my $row = $stmt_pmk_list->fetchrow_hashref()){
                    if(process_row(lc($ap_mac),lc($sa_mac),$EAPOL1,$EAPOL2,$ssid,$row->{'ppsk'},$row)){
                        #Formulate the reply
                        formulate_reply($row,$realm_id);
                        $match_found = 1;
                        last;
                    }
                }
                $stmt_pmk_list->finish();
                if($match_found == 0){
                    $RAD_REPLY{'Reply-Message'} = "No PPSK Match Found";
                    $return = RLM_MODULE_REJECT;               
                }            
            }                     
        }        
    }
}

# subs below are from the eapol mic matching code

sub extract_wpa_key_data {
  my $wpa_key_data_hash = {};
  my ($offset, $eapol) = @_;
  my ($wpa_key_data_length) =  unpack("x${offset}n", $eapol);
  $offset += 2;
  my ($wpa_key_data) = a2b(unpack("x${offset}H".${wpa_key_data_length}*2, $eapol));
  $wpa_key_data_hash->{'data'} = $wpa_key_data;
  $offset = 0;
  while ($offset < $wpa_key_data_length) {
    my ($tag_number, $tag_length) = unpack("x${offset}CC", $wpa_key_data);
    $offset += 2;
    my ($tag_data) = a2b(unpack("x${offset}H".${tag_length}*2, $wpa_key_data));
    $offset += $tag_length;
    if ($tag_number == TAG_MOBILITY_DOMAIN) {
      $wpa_key_data_hash->{'MDID'} = unpack("H4", $tag_data);
    }
    elsif ($tag_number == TAG_FAST_BSS_TRANSITION) {
      my $tag_offset = 82;
      while ($tag_offset < $tag_length) {
        my ($subelement_id,$subelement_length) = unpack("x${tag_offset}CC", $tag_data);
        $tag_offset +=2;
        my ($key_holder) = unpack("x${tag_offset}H".${subelement_length}*2, $tag_data);
        $tag_offset+=$subelement_length;
        if ($subelement_id == PMK_R1_KEY_HOLDER_ID) {
          $wpa_key_data_hash->{'R1KH'} = $key_holder;
        }
        elsif ($subelement_id == PMK_R0_KEY_HOLDER_ID) {
          $wpa_key_data_hash->{'R0KH'} = $key_holder;
        }
      }
    }
  }
  return $wpa_key_data_hash;
}

sub sha256_prf {
  my ($key, $A, $B, $size) = @_;
  my $blen = int($size/8);
  my $num_iter = round(($blen / 32));
  my $counter = 1;
  my $R = "";
  foreach (1..$num_iter) {
    my $digest = hmac_sha256(pack("S<H*H*S<", $counter, b2a($A), b2a($B), $size), $key);
    $R = $R . $digest;
    $counter+=1;
  }
  return a2b(substr(b2a($R), 0, $blen * 2));
}

sub PRF_512 {
    my ($key, $A, $B) = @_;
    my $result = '';
    for my $i (0 .. 3) {
        my $input = $A . chr(0) . $B . chr($i);
        $result .= hmac_sha1($input, $key);
    }
    return substr($result, 0, 64);
}

sub a2b {
    my ($s) = @_;
    return pack("H*", $s);
}

sub b2a {
    my ($by) = @_;
    return unpack("H*", $by);
}

sub process_row {

    my $match_found = 0;
    my ($AP_MAC,$SA_MAC,$EAPOL1,$EAPOL2,$SSID,$PASS,$line) = @_;
       
    #my $PMK    = pbkdf2($SSID, $PASS, 4096, 32); #calculate PMK
    #my $Hex    = b2a($PMK);
    #$PMK       = a2b($Hex);
    my $PMK    = a2b($line->{'pmk'});

    my $STA_NONCE = unpack("x17H64", $EAPOL2);
    
    #&radiusd::radlog(1, "=====Whooop $Hex $line->{'pmk'} ======");  
    my $wpa_key_data = extract_wpa_key_data(97, $EAPOL2);
    my $r0_key_data = sha256_prf($PMK, pack("A*","FT-R0"), pack("CA*H*CH*H*", length($SSID), $SSID, $wpa_key_data->{'MDID'}, length(a2b($wpa_key_data->{'R0KH'})), $wpa_key_data->{'R0KH'}, $SA_MAC ), 384);
    my $pmkr1 = sha256_prf(a2b(substr(b2a($r0_key_data),0,64)), pack("A*","FT-R1"), pack("H*H*", $wpa_key_data->{'R1KH'}, $SA_MAC), 256);
    my $ptk = sha256_prf($pmkr1, pack("A*","FT-PTK"), pack("H*H*H*H*", $STA_NONCE, b2a($EAPOL1), $AP_MAC, $SA_MAC), 384);
    my $kck = a2b(substr(b2a($ptk),0,32));
    my $calc_mic = Digest::CMAC->new($kck, 'Crypt::Rijndael');
    my @EAPOL_ARR = unpack("H162x16H*", $EAPOL2);
    my $EAPOL_CALC = a2b($EAPOL_ARR[0] . "00"x16 . $EAPOL_ARR[1]);
    $calc_mic->add($EAPOL_CALC);
    
    # try to validate the MIC in EAPoL message #2 is correct
    my $MICFOUND = unpack("x81H32", $EAPOL2);
    my $MICCALC = b2a($calc_mic->digest);

    &radiusd::radlog(0,"MICFOUND: $MICFOUND.  MICCALC: $MICCALC");

    if ($MICFOUND eq $MICCALC) {
        &radiusd::radlog("2","PPSK Match found $PASS");
        $match_found = 1;
    }
    return $match_found;
}

sub pbkdf2 {
    my ($salt, $password, $iterations, $key_length) = @_;
    my $pbkdf2 = Crypt::PBKDF2->new(
        hash_class => 'HMACSHA1',
        iterations => $iterations,
        output_len => $key_length,
        salt_len => 14
        );
    my $result = $pbkdf2->PBKDF2($salt,$password);
    return $result;
}

sub formulate_reply{
    my ($row,$realm_id) = @_;   
    #---- SAMPLE STRUCTURE ---
    #$VAR1 = {
    #          'username' => 'unit2@jhb-south',
    #          'active' => 1,
    #          'pmk' => '24869bfda093c9a0d54422d847588c1073ab4eefb6925ef7f853aafe7e94563e',
    #          'vlan' => 50,
    #          'ppsk' => '88888888'
    #        };
    #------------------------
    
    #Get the cleartext password   
    my $password = '';
    $stmt_password->execute($row->{'username'});     
    while(my $row = $stmt_password->fetchrow_hashref()){        
        $password = $row->{'value'};
    }
    $stmt_password->finish();
    
    if($password eq ''){
        $RAD_REPLY{'Reply-Message'} = "Missing Cleartext Password For $row->{'username'}";
        $return = RLM_MODULE_REJECT;
        return;      
    }

    $RAD_REQUEST{'User-Name'}       = $row->{'username'};    
    $RAD_REQUEST{'User-Password'}   = $password;
    
    ##Reply with the username we want for accounting records
    ##hostapd will then use this in the accounting record
    $RAD_REPLY{'User-Name'}         = $row->{'username'};
    
    $return = RLM_MODULE_UPDATED;

    if($row->{'active'} == 0){
        &radiusd::radlog("2", "Username $row->{'username'} account disabled");
        #We are out of here ...
        return;   
    }
    
    $RAD_REPLY{'Tunnel-Medium-Type'} = "IEEE-802";
    $RAD_REPLY{'Tunnel-Password'} = $row->{'ppsk'};

    if($row->{'vlan'}){
        $RAD_REPLY{'Tunnel-Type'} = "VLAN";
		$RAD_REPLY{'Tunnel-Private-Group-ID'} = $row->{'vlan'};		    
    } 

    if($row->{'session_limit'}){
	    if($row->{'session_limit'} > 0){
		$RAD_CHECK{'Simultaneous-Use'} = $row->{'session_limit'};
	    }
    }
}


