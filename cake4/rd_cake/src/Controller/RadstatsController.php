<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;

class RadstatsController extends AppController{

    protected $main_model   = 'Radstats';
    
    protected  $time_zone   = 'UTC'; //Default for timezone
    protected  $base_search = false;
    
    protected  $srvid_auth  = 'radiator-radius_auth';
    protected  $srvid_acct  = 'radiator-radius_acct';
    protected  $srvid_coa   = 'radiator-radius_proxy_coa';
    protected  $objtype     = 'ServerConfig';
    
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Radstats');
        $this->loadModel('Timezones'); 
        $this->loadComponent('Aa');
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');          
    }
    
    public function indexServers(){
        
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        
        $items  = [];
        $req_q  = $this->request->getQuery();  
          
        if(isset($req_q['all_option'])&&($req_q['all_option']==='true')){
            $items[]=[
                'id'  	=> 0, 
                'name'  => '** ALL SERVERS **'
            ];       
        }
                
        $hostnames = $this->fetchTable('Radstats')
            ->find()
            ->select(['hostname'])
            ->distinct(['hostname'])
            ->orderAsc('hostname')
            ->all()
            ->extract('hostname')
            ->toList();
        foreach($hostnames as $hostname){
                $items[] = [
                'id'    => $hostname,
                'name'  => $hostname
            ]; 
        }
                  
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function index(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
    
        //--day--
        $day    = $this->request->getQuery('day'); //day will be in format 'd/m/Y'
        
        if($day){
            $ft_day = FrozenTime::createFromFormat('d/m/Y',$day);     
        }else{
            $ft_day = FrozenTime::now();
        }
        
        //--span--
        $span = 'day'; //default
        if($this->request->getQuery('span')){
            $span = $this->request->getQuery('span');
        }
         
       
        //VERY IMPORTANT
        $this->_setTimeZone();
        //Base Search
        $this->base_search = $this->_base_search();
        
        $data   = [];
        
        if($span === 'day'){               
            $data['graph']  = $this->_getDailyGraph($ft_day);        
        }
        if($span === 'week'){               
            $data['graph']  = $this->_getWeeklyGraph($ft_day);
        }
        if($span === 'month'){               
            $data['graph']  = $this->_getMonthlyGraph($ft_day);
        }
        
        $data['polar']['totals']  = $this->_getTotal($ft_day,$span);
        $data['polar']['balance'] = $this->_getBalance($ft_day,$span);
        $data['summary']          = $this->_getSummary($ft_day,$span);
      /*  $data['summary']          = [
            'date'      => $ft_day,
            'timespan'  => 'Day',
            'requests'  => 186432,
            'avg_rtt'   => 0.00631 // seconds
        ];*/
    
        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    private function _getSummary($ft_day,$span){
    
        $base_search[]  = ['Radstats.objtype' => $this->objtype ]; //Only Type 'ServerConfig'        
        //If they selected a specific server (all servers = 0)
        if (array_key_exists('server_id', $this->request->getQueryParams())) {      
            if($this->request->getQuery('server_id') !== '0'){
                $base_search[]  = ['Radstats.hostname' => $this->request->getQuery('server_id')];            
            }
        }
        $where          = $base_search;
        
        if($span === 'day'){
            $slot_start = $ft_day->startOfDay(); 
            $slot_end   = $ft_day->endOfDay();
        }
        if($span === 'week'){
            $slot_start = $ft_day->startOfWeek();
            $slot_end   = $ft_day->endOfWeek();         
        }
        if($span === 'month'){
            $slot_start = $ft_day->startOfMonth(); //Prime it 
            $slot_end   = $ft_day->endOfMonth();//->i18nFormat('yyyy-MM-dd HH:mm:ss');             
        }
        
        $slot_start_txt = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
        $slot_end_txt   = $slot_end->i18nFormat('yyyy-MM-dd HH:mm:ss');
        
        $query = $this->Radstats->find();
        $time_start = $query->func()->CONVERT_TZ([
            "'$slot_start_txt'"     => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);        
        $time_end = $query->func()->CONVERT_TZ([
            "'$slot_end_txt'"       => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);
        array_push($where, ["created >=" => $time_start]);
        array_push($where, ["created <=" => $time_end]);
        
        //print_r($where);
    
        $q = $this->Radstats->find();
        $result = $q->select(['requests' => 'sum(requests)','responsetime' => 'avg(responsetime)'])
            ->where($where)
            ->first();
        
        $data = ['date' => $ft_day, 'timespan' => ucfirst($span),'requests' => $result->requests, 'avg_rtt' => $result->responsetime];
        return $data;  
    }
    
    private function _getBalance($ft_day,$span){
    
        $base_search[]  = ['Radstats.objtype' => $this->objtype ]; //Only Type 'ServerConfig'
        $where          = $base_search;
        
        $server_list    = [];
        $items          = [];
        
        //If they selected a specific server (all servers = 0)
        if (array_key_exists('server_id', $this->request->getQueryParams())) {
            if($this->request->getQuery('server_id') === '0'){
                $hostnames = $this->fetchTable('Radstats')
                    ->find()
                    ->select(['hostname'])
                    ->distinct(['hostname'])
                    ->orderAsc('hostname')
                    ->all()
                    ->extract('hostname')
                    ->toList();
                foreach($hostnames as $hostname){
                        $server_list[] = $hostname; 
                }   
                
            }else{
                $server_list[] = $this->request->getQuery('server_id');             
            }
        }
        
        if($span === 'day'){
            $slot_start = $ft_day->startOfDay(); 
            $slot_end   = $ft_day->endOfDay();
        }
        if($span === 'week'){
            $slot_start = $ft_day->startOfWeek();
            $slot_end   = $ft_day->endOfWeek();         
        }
        if($span === 'month'){
            $slot_start = $ft_day->startOfMonth(); //Prime it 
            $slot_end   = $ft_day->endOfMonth();//->i18nFormat('yyyy-MM-dd HH:mm:ss');             
        }
        
        $slot_start_txt = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
        $slot_end_txt   = $slot_end->i18nFormat('yyyy-MM-dd HH:mm:ss');
        
        $query = $this->Radstats->find();
        $time_start = $query->func()->CONVERT_TZ([
            "'$slot_start_txt'"     => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);        
        $time_end = $query->func()->CONVERT_TZ([
            "'$slot_end_txt'"       => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);
        array_push($where, ["created >=" => $time_start]);
        array_push($where, ["created <=" => $time_end]);
        
        //Loop through server list
        $counter = 1;
        foreach($server_list as $server){           
            $new_where = $where;
            array_push($new_where, ["hostname" => $server]);
            $q = $this->Radstats->find(); 
            $result = $q->select(['requests' => 'sum(requests)','responsetime' => 'avg(responsetime)'])
                ->where($new_where)
                ->first();
            if($result){
                $items[] = ['id' => $counter, 'hostname' => $server, 'requests' => $result->requests,'responsetime' => $result->responsetime ];
                $counter++;
            }  
        }
        return $items;                 
    }
    
    private function _getTotal($ft_day,$span){
        $items          = [];
        $base_search    = $this->base_search;
        $where          = $base_search;
        
        if($span === 'day'){
            $slot_start = $ft_day->startOfDay(); 
            $slot_end   = $ft_day->endOfDay();
        }
        if($span === 'week'){
            $slot_start = $ft_day->startOfWeek();
            $slot_end   = $ft_day->endOfWeek();         
        }
        if($span === 'month'){
            $slot_start = $ft_day->startOfMonth(); //Prime it 
            $slot_end   = $ft_day->endOfMonth();//->i18nFormat('yyyy-MM-dd HH:mm:ss');             
        }       
                
        $slot_start_txt = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
        $slot_end_txt   = $slot_end->i18nFormat('yyyy-MM-dd HH:mm:ss');
        
        $query = $this->Radstats->find();
        $time_start = $query->func()->CONVERT_TZ([
            "'$slot_start_txt'"     => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);        
        $time_end = $query->func()->CONVERT_TZ([
            "'$slot_end_txt'"       => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);
        array_push($where, ["created >=" => $time_start]);
        array_push($where, ["created <=" => $time_end]);
        $q = $this->Radstats->find(); 
        $result = $q->select($this->_getFields($q))
            ->where($where)
            ->first();
        if($result){
            $items[] = ['id' => 1, 'objtype' => 'Authentication' , 'requests' => $result->requests_auth,    'responsetime' => $result->avg_rtt_auth];
            $items[] = ['id' => 2, 'objtype' => 'Accounting' , 'requests' => $result->requests_acct,        'responsetime' => $result->avg_rtt_acct];
            $items[] = ['id' => 3, 'objtype' => 'COA' , 'requests' => $result->requests_coa,                'responsetime' => $result->avg_rtt_coa];
        }
        return $items;
    }
    
    private function _getDailyGraph($ft_day){
    
        $items          = [];
        $count          = 1;
        $base_search    = $this->base_search;
        $day_end        = $ft_day->endOfDay();//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
        $slot_start     = $ft_day->startOfDay(); //Prime it 
        while($slot_start < $day_end){
        
            $slot_start_h_m     = $slot_start->i18nFormat("E\nHH:mm");
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addHour(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss');
            
            $where              = $base_search;
            
            $query = $this->{'Radstats'}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
                 
            array_push($where, ["created >=" => $time_start]);
            array_push($where, ["created <=" => $time_end]);
            
            $slot_start     = $slot_start->addHour(1);           
            $q = $this->Radstats->find();    
            $result = $q->select($this->_getFields($q))
                ->where($where)
                ->first();            

            if($result){
                $result->time_unit  = $slot_start_h_m;
                $result->id         = $count;
                array_push($items, $result);
            }
            $count++;
        }
        return(['items' => $items]);
    }
    
    private function _getWeeklyGraph($ft_day){
    
        $items          = [];
        $week_end       = $ft_day->endOfWeek();//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
        $slot_start     = $ft_day->startOfWeek(); //Prime it 
        $count          = 1;
        $base_search    = $this->base_search;
     
        while($slot_start < $week_end){
        
            $slot_start_h_m     = $slot_start->i18nFormat("eee dd MMM");
            $where              = $base_search; 
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addDay(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss'); //Our interval is one day
            
            $query = $this->{'Radstats'}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
                 
            array_push($where, ["created >=" => $time_start]);
            array_push($where, ["created <=" => $time_end]);
            
            $slot_start         = $slot_start->addDay(1);
                      
            $q = $this->Radstats->find();    
            $result = $q->select($this->_getFields($q))
                ->where($where)
                ->first();            

            if($result){
                $result->time_unit  = $slot_start_h_m;
                $result->id         = $count;
                array_push($items, $result);
            }
            $count++;
        }
        return(['items' => $items]);
    }
    
    private function _getMonthlyGraph($ft_day){
    
        $items          = [];
        $slot_start     = $ft_day->startOfMonth(); //Prime it 
        $month_end      = $ft_day->endOfMonth();//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
            
        $count          = 1;
        $base_search    = $this->base_search;
        
        while($slot_start < $month_end){
        
            $slot_start_h_m     = $slot_start->i18nFormat("eee dd MMM");
            $where              = $base_search; 
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addDay(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss'); //Our interval is one day
            
            $query = $this->{'Radstats'}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
                 
            array_push($where, ["created >=" => $time_start]);
            array_push($where, ["created <=" => $time_end]);
            
            $slot_start         = $slot_start->addDay(1);
                      
            $q = $this->Radstats->find();    
            $result = $q->select($this->_getFields($q))
                ->where($where)
                ->first();            

            if($result){
                $result->time_unit  = $slot_start_h_m;
                $result->id         = $count;
                array_push($items, $result);
            }
            $count++;
        }
        return(['items' => $items]);
    }    
    
    private function _setTimezone(){ 
        //New way of doing things by including the timezone_id
        if($this->request->getQuery('timezone_id') != null){
            $tz_id = $this->request->getQuery('timezone_id');
            $ent = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
            if($ent){
                $this->time_zone = $ent->name;
            }
        }
    }
    
    private function _getFields($q){
        
        $fields     = [
            'requests_acct' => $q->newExpr(
                "SUM(CASE WHEN srvidentifier = 'radiator-radius_acct' THEN requests ELSE 0 END)"
            ),
            'requests_coa' => $q->newExpr(
                "SUM(CASE WHEN srvidentifier = 'radiator-radius_proxy_coa' THEN requests ELSE 0 END)"
            ),
            'requests_auth' => $q->newExpr(
                "SUM(CASE WHEN srvidentifier = 'radiator-radius_auth' THEN requests ELSE 0 END)"
            ),
            // Optional: per-bucket average response time
            'avg_rtt_acct' => $q->newExpr(
                "AVG(CASE WHEN srvidentifier = 'radiator-radius_acct' THEN responsetime END)"
            ),
            'avg_rtt_coa' => $q->newExpr(
                "AVG(CASE WHEN srvidentifier = 'radiator-radius_proxy_coa' THEN responsetime END)"
            ),
            'avg_rtt_auth' => $q->newExpr(
                "AVG(CASE WHEN srvidentifier = 'radiator-radius_auth' THEN responsetime END)"
            ),
        ];        
        return $fields;           
    }
    
    private function _base_search(){

        $base_search[]  = ['Radstats.objtype' => $this->objtype ]; //Only Type 'ServerConfig'
        
        //If they selected a specific server (all servers = 0)
        if (array_key_exists('server_id', $this->request->getQueryParams())) {
            if(!($this->request->getQuery('server_id') === '0')){
                $base_search[] = ['Radstats.hostname' => $this->request->getQuery('server_id')];
            }    
        }        
        return $base_search;
    }    
   
}

?>
