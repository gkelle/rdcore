Ext.define('Rd.view.meshes.vcMeshExitPoint', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshExitPoint',
    config : {
        urlViewExit : '/cake4/rd_cake/meshes/mesh_exit_view.json',
    },
    init: function() {
        var me = this;
    }, 
    onChkApplyFirewallProfileChange: function(chk){
		var me 		= this;
		var form    = chk.up('form');
		var fw_prof = form.down('cmbFirewallProfile');
		if(chk.getValue()){
		    fw_prof.enable();		   
		}else{
		    fw_prof.disable();
		}
	},
	onChkApplySqmProfileChange: function(chk){
		var me 		    = this;
		var form        = chk.up('form');
		var sqm_prof    = form.down('cmbSqmProfile');
		if(chk.getValue()){
		    sqm_prof.enable();		   
		}else{
		    sqm_prof.disable();
		}
	},
	onChkDnsOverrideChange: function(chk){
		var me 		= this;
		var form    = chk.up('form');
		var d1      = form.down('#txtDns1');
		var d2      = form.down('#txtDns2');
		if(chk.getValue()){
		    d1.enable();
		    d2.enable();
		}else{
		    d1.disable();
		    d2.disable();
		}
	},
	onRgrpProtocolChange : function(grp){
	    var me          = this; 
	    var win         = grp.up('window');
	    var txtIpaddr   = win.down('#txtIpaddr');
        var txtNetmask  = win.down('#txtNetmask');
        var txtGateway  = win.down('#txtGateway');
        var txtDns1Tagged     = win.down('#txtDns1Tagged');
        var txtDns2Tagged     = win.down('#txtDns2Tagged');
        
        if(grp.getValue().proto == 'static'){         
            txtIpaddr.setVisible(true);
		    txtIpaddr.setDisabled(false);
            txtNetmask.setVisible(true);
            txtNetmask.setDisabled(false);  
            txtGateway.setVisible(true);
            txtGateway.setDisabled(false);     
            txtDns1Tagged.setVisible(true);
            txtDns1Tagged.setDisabled(false);
            txtDns2Tagged.setVisible(true);  
            txtDns2Tagged.setDisabled(false);
        }else{
            txtIpaddr.setVisible(false);
		    txtIpaddr.setDisabled(true);
            txtNetmask.setVisible(false);
            txtNetmask.setDisabled(true);  
            txtGateway.setVisible(false);
            txtGateway.setDisabled(true);     
            txtDns1Tagged.setVisible(false);
            txtDns1Tagged.setDisabled(true);
            txtDns2Tagged.setVisible(false);  
            txtDns2Tagged.setDisabled(true);
        }
	},
	sldrSpeedDownChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
    },
	sldrSpeedUpChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
    },
    loadExit: function(win){
        var me      = this; 
        var form    = win.down('form');
        var exitId = win.exitId;
        form.setLoading(true);
        form.load({
            url         :me.getUrlViewExit(), 
            method      :'GET',
            params      :{exit_id:exitId},
            success     : function(a,b,c){
                var t     = form.down("#type");
                var t_val = t.getValue();
                var vlan  = form.down('#vlan');
                var vpn   = form.down('#cmbOpenVpnServers');
                var pppoe = form.down('#cmbAccelProfiles');
                
                var rgrpProtocol= form.down('#rgrpProtocol');
                var txtIpaddr   = form.down('#txtIpaddr');
                var txtNetmask  = form.down('#txtNetmask');
                var txtGateway  = form.down('#txtGateway');
                var txtDns1     = form.down('#txtDns1');
                var txtDns2     = form.down('#txtDns2');
                var txtDns1Tagged       = form.down('#txtDns1Tagged');
                var txtDns2Tagged       = form.down('#txtDns2Tagged');
                var tagConWith          = form.down('tagMeshEntryPoints'); 
                var chkStats    = form.down('#chkNetworkStats');
                
                if(t_val == 'openvpn_bridge'){
                    vpn.setVisible(true);
                    vpn.setDisabled(false);
                    
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                    pppoe.setVisible(false);
                    pppoe.setDisabled(true);
                }else{
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }
                
                if(t_val == 'pppoe_server'){
                    pppoe.setVisible(true);
                    pppoe.setDisabled(false);
                    
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }else{
                    pppoe.setVisible(false);
                    pppoe.setDisabled(true);
                }
                  
                if(t_val == 'tagged_bridge'){
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                    
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }else{
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                }
                
                if(t_val == 'nat'){
                    chkStats.show();
                    chkStats.enable();           
                }else{
                    chkStats.hide();
                    chkStats.disable();
                }
                              
                var ent  = form.down("tagMeshEntryPoints");
                ent.setValue(b.result.data.entry_points);
                if(b.result.data.type == 'captive_portal'){
                    if((b.result.data.auto_login_page == true)&&
                    (b.result.data.dynamic_detail != null)){
                        var cmb     = form.down("cmbDynamicDetail");
                        var rec     = Ext.create('Rd.model.mDynamicDetail', {name: b.result.data.dynamic_detail, id: b.result.data.dynamic_detail_id});
                        cmb.getStore().loadData([rec],false);
                        cmb.setValue( b.result.data.dynamic_detail_id );
                    }else{
                        //FIXME PLEASE CHECK WHAT MUST HAPPEN HERE
                        //form.down("cmbDynamicDetail").setVisible(false);
                        //form.down("cmbDynamicDetail").setDisabled(true);
                    }
                }
                
                if(b.result.data.type == 'tagged_bridge_l3'){
                
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                    rgrpProtocol.setVisible(true);
                    rgrpProtocol.setDisabled(false);
                    
                    if(rgrpProtocol.getValue().proto == 'static'){         
                        txtIpaddr.setVisible(true);
			            txtIpaddr.setDisabled(false);
                        txtNetmask.setVisible(true);
                        txtNetmask.setDisabled(false);  
                        txtGateway.setVisible(true);
                        txtGateway.setDisabled(false);     
                        txtDns1Tagged.setVisible(true);
                        txtDns1Tagged.setDisabled(false);
                        txtDns2Tagged.setVisible(true);  
                        txtDns2Tagged.setDisabled(false);
                    }else{
                        txtIpaddr.setVisible(false);
			            txtIpaddr.setDisabled(true);
                        txtNetmask.setVisible(false);
                        txtNetmask.setDisabled(true);  
                        txtGateway.setVisible(false);
                        txtGateway.setDisabled(true);     
                        txtDns1Tagged.setVisible(false);
                        txtDns1Tagged.setDisabled(true);
                        txtDns2Tagged.setVisible(false);  
                        txtDns2Tagged.setDisabled(true);
                    }
                    tagConWith.setVisible(false);
                    tagConWith.setDisabled(true);
                    
                }else{
                
                    rgrpProtocol.setVisible(false);
                    rgrpProtocol.setDisabled(true);
                    txtIpaddr.setVisible(false);
			        txtIpaddr.setDisabled(true);
                    txtNetmask.setVisible(false);
                    txtNetmask.setDisabled(true);  
                    txtGateway.setVisible(false);
                    txtGateway.setDisabled(true);     
                    txtDns1Tagged.setVisible(false);
                    txtDns1Tagged.setDisabled(true);
                    txtDns2Tagged.setVisible(false);  
                    txtDns2Tagged.setDisabled(true);
                    
                    tagConWith.setVisible(true);
                    tagConWith.setDisabled(false);
                }
                
                form.setLoading(false);      
            }
        });
    } 
});
