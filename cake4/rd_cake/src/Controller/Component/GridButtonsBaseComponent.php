<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component used to check and produce Ajax-ly called grid tooblaar items
//---- Date: 08-JUL-2025
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class GridButtonsBaseComponent extends Component {

    protected $scale        = 'large';  //Later we will improve the code to change this to small for smaller screens
    
    protected $btnUiReload  = 'button-orange';
    protected $btnUiAdd     = 'button-green';
    protected $btnUiDelete  = 'button-red';
    protected $btnUiEdit    = 'button-blue';
    protected $btnUiView    = 'button-orange';
    
    protected $btnUiNote    = 'default';
    protected $btnUiCSV     = 'default';
    protected $btnUiPassword = 'default';
    protected $btnUiRadius  = 'default';
    protected $btnUiEnable  = 'default';
    protected $btnUiGraph   = 'default';
    protected $btnUiMail    = 'default';
    protected $btnUiPdf     = 'default';
    protected $btnUiMap     = 'default';
    protected $btnUiBan     = 'default';
    protected $btnUiUnknownClients = 'button-green';
    protected $btnUiByod    = 'button-metal';
    protected $btnUiTopUp   = 'button-metal';
    
    protected $btnUiConfigure = 'default';
    protected $btnUiPolicies  = 'default';
    protected $btnUiUsers     = 'default';
    protected $btnUiTags      = 'default';
    protected $btnUiChangeMode = 'default';
    protected $btnUiRedirect  = 'default';
    protected $btnUiAttach    = 'button-blue';
    protected $btnUiAdvancedEdit = 'button-orange';
    
    protected $btnUiExecute     = 'button-green';
    protected $btnUiHistory     = 'button-blue';
    protected $btnUiRestart     = 'button-red';
    protected $btnUiRogue       = 'button-orange';
     
    protected $btnUiProfComp    = 'button-metal';
    
    
    // Execute any other additional setup for your component.
    public function initialize(array $config):void
    {
        $this->btnReload = [
            'xtype'     =>  'button', 
            'glyph'     => Configure::read('icnReload'),
            'scale'     => $this->scale,
            'itemId'    => 'reload',
            'tooltip'   => __('Reload'),
            'ui'        => $this->btnUiReload
        ];
        $this->btnReloadTimer = [
            'xtype'     => "splitbutton",
            'glyph'     => Configure::read('icnReload'),
            'scale'     => $this->scale,
            'itemId'    => 'reload',
            'tooltip'   => __('Reload'),
            'ui'        => $this->btnUiReload,
            'menu'      => [
                'items' => [
                    '<b class="menu-title">Reload every:</b>',
                    array( 'text'  => __('30 seconds'),      'itemId'    => 'mnuRefresh30s', 'group' => 'refresh','checked' => false ),
                    array( 'text'  => __('1 minute'),        'itemId'    => 'mnuRefresh1m', 'group' => 'refresh' ,'checked' => false),
                    array( 'text'  => __('5 minutes'),       'itemId'    => 'mnuRefresh5m', 'group' => 'refresh', 'checked' => false ),
                    array( 'text'  => __('Stop auto reload'),'itemId'    => 'mnuRefreshCancel', 'group' => 'refresh', 'checked' => true)
                ]
            ]
        ];
        $this->btnAdd =  [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnAdd'),
            'scale'     => $this->scale,
            'itemId'    => 'add',
            'tooltip'   => __('Add'),
            'ui'        => $this->btnUiAdd
        ];
		
        $this->btnEdit =  [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnEdit'),
            'scale'     => $this->scale,
            'itemId'    => 'edit',
            'tooltip'   => __('Edit'),
            'ui'        => $this->btnUiEdit
        ];
		
        $this->btnDelete =  [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnDelete'),
            'scale'     => $this->scale,
            'itemId'    => 'delete',
            'tooltip'   => __('Delete'),
            'ui'        => $this->btnUiDelete
        ];

        $this->btnNote = [
            'xtype'     => 'button',     
            'glyph'     => Configure::read('icnNote'), 
            'scale'     => $this->scale, 
            'itemId'    => 'note',    
            'tooltip'   => __('Add notes'),
            'ui'        => $this->btnUiNote
        ];

        $this->btnCsvDownload = [
            'xtype'     => 'button',     
            'glyph'     => Configure::read('icnCsv'), 
            'scale'     => $this->scale, 
            'itemId'    => 'csv',      
            'tooltip'   => __('Download CSV list'),
            'ui'        => $this->btnUiCSV          
        ];
        
        $this->btnCsvUpload = [
            'xtype'     => 'button',     
            'scale'     => $this->scale, 
            'itemId'    => 'upload',      
            'glyph'     => Configure::read('icnUpload'),
            'tooltip'   => __('Upload CSV list'),
            'ui'        => 'default'          
        ];

        $this->btnPassword = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnLock'), 
            'scale'     => $this->scale, 
            'itemId'    => 'password', 
            'tooltip'   => __('Change Password'),
            'ui'        => $this->btnUiPassword
        ];

        $this->btnEnable = [
            'xtype'     => 'button',  
            'glyph'     => Configure::read('icnLight'),
            'scale'     => $this->scale, 
            'itemId'    => 'enable_disable',
            'tooltip'   => __('Enable / Disable'),
            'ui'        => $this->btnUiEnable
        ];

        $this->btnRadius = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnRadius'), 
            'scale'     => $this->scale, 
            'itemId'    => 'test_radius',  
            'tooltip'   => __('Test RADIUS'),
            'ui'        => $this->btnUiRadius
        ];

        $this->btnGraph = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnGraph'),   
            'scale'     => $this->scale, 
            'itemId'    => 'graph',  
            'tooltip'   => __('Graphs'),
            'ui'        => $this->btnUiGraph
        ];

        $this->btnMail = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnEmail'),
            'scale'     => $this->scale, 
            'itemId'    => 'email', 
            'tooltip'   => __('e-Mail voucher'),
            'ui'        => $this->btnUiMail
        ];

        $this->btnPdf  = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnPdf'),    
            'scale'     => $this->scale, 
            'itemId'    => 'pdf',      
            'tooltip'   => __('Export to PDF'),
            'ui'        => $this->btnUiPdf
        ];
        
        $this->btnAddMesh = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnNode'), 
            'scale'     => $this->scale,
            'itemId'    => 'attachMesh',      
            'tooltip'=> __('Add To Mesh'),
            'ui'        => $this->btnUiAttach
        ];
        
        $this->btnAddAp = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnCube'), 
            'scale'     => $this->scale,
            'itemId'    => 'attachAp',      
            'tooltip'=> __('Add To AP Profile'),
            'ui'        => $this->btnUiAttach
        ];
        
        
        $this->btnAttach = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnAttach'), 
            'scale'     => $this->scale,
            'itemId'    => 'attach',      
            'tooltip'=> __('Attach'),
            'ui'        => $this->btnUiAttach
        ];
        
        $this->btnRedirect = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnRedirect'), 
            'scale'     => $this->scale, 
            'itemId'    => 'redirect',   
            'tooltip'   => __('Redirect'),
            'ui'        => $this->btnUiRedirect
        ];
        
        $this->btnChangeMode = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnSpanner'), 
            'scale'     => $this->scale, 
            'itemId'    => 'change_device_mode',   
            'tooltip'   => __('Change Device Mode'),
            'ui'        => $this->btnUiChangeMode
        ];
		
        $this->btnMap = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnMap'), 
            'scale'     => $this->scale, 
            'itemId'    => 'map',   
            'tooltip'   => __('Map'),
            'ui'        => $this->btnUiMap
        ];
        
        $this->btnBan   = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnBan'), 
            'scale'     => $this->scale, 
            'itemId'    => 'ban',   
            'tooltip'   => 'Blocked and Speed Limited Devices',
            'ui'        => $this->btnUiBan
        ];
      
		
        $this->btnTags = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnTag'), 
            'scale'     => $this->scale, 
            'itemId'    => 'tag',   
            'tooltip'   => __('Manage tags'),
            'ui'        => $this->btnUiTags
        ];
        
        $this->btnPolicies = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnScale'), 
            'scale'     => $this->scale, 
            'itemId'    => 'btnPolicies',   
            'tooltip'   => __('Policies'),
            'ui'        => $this->btnUiPolicies 
        ];
        
        $this->btnUsers = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnUser'), 
            'scale'     => $this->scale, 
            'itemId'    => 'btnUsers',   
            'tooltip'   => __('Users'),
            'ui'        => $this->btnUiUsers 
        ];
        $this->btnConfigure = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnConfigure'), 
            'scale'     => $this->scale, 
            'itemId'    => 'preferences',   
            'tooltip'   => __('Preferences'),
            'ui'        => $this->btnUiConfigure
        ];
        $this->btnByod = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnDevice'), 
            'scale'     => $this->scale,
            'itemId'    => 'byod',
            'tooltip'   => __('BYOD'),
            'ui'        => $this->btnUiByod
        ];
        
        $this->btnTopUp = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnTopUp'), 
            'scale'     => $this->scale,
            'itemId'    => 'topup',
            'tooltip'   => __('Top-Ups'),
            'ui'        => $this->btnUiTopUp
        ];
               
        $this->btnProfComp = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnComponent'), 
            'scale'     => $this->scale,
            'itemId'    => 'profile_components',
            'tooltip'   => __('Profile Components'),
            'ui'        => $this->btnUiProfComp
        ];
        
        $this->btnUnknownClients = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnBus'), 
            'scale'     => $this->scale,
            'itemId'    => 'unknown_clients',
            'tooltip'   => __('New Arrivals'),
            'ui'        => $this->btnUiUnknownClients
        ];
        
        $this->btnAdvancedEdit = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnGears'), 
            'scale'     => $this->scale,
            'itemId'    => 'advanced_edit',
            'tooltip'   => __('Advanced Edit'),
            'ui'        => $this->btnUiAdvancedEdit
        ]; 
        
        $this->btnView = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnView'), 
            'scale'     => $this->scale,
            'itemId'    => 'view',
            'tooltip'   => __('View'),
            'ui'        => $this->btnUiView
        ];
        
        $this->btnExecute = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnSpanner'), 
            'scale'     => $this->scale,
            'itemId'    => 'execute',
            'tooltip'   => __('Execute'),
            'ui'        => $this->btnUiExecute
        ];
        
        $this->btnHistory = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnWatch'), 
            'scale'     => $this->scale,
            'itemId'    => 'history',
            'tooltip'   => __('View execute history'),
            'ui'        => $this->btnUiHistory
        ];
        
        $this->btnRestart = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnPower'), 
            'scale'     => $this->scale,
            'itemId'    => 'restart',
            'tooltip'   =>  __('Restart'),
            'ui'        => $this->btnUiRestart
        ];
        
        $this->btnRogue = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnEyeSlash'), 
            'scale'     => $this->scale,
            'itemId'    => 'rogue_detect',
            'tooltip'   =>  __('Detect Rogue Access Points'),
            'ui'        => $this->btnUiRogue
        ];
        
        $this->btnAvailable = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnWatch'), 
            'scale'     => $this->scale,
            'itemId'    => 'available',
            'tooltip'   => __('View Availability History'),
            'ui'        => $this->btnUiHistory
        ]; 
        
        $this->btnAcknowledged = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnHandshake'), 
            'scale'     => $this->scale,
            'itemId'    => 'acknowledged',
            'tooltip'   => __('Acknowlege Alert'),
            'ui'        => $this->btnUiEdit
        ]; 
        
        $this->btnApi = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnGears'), 
            'scale'     => $this->scale,
            'itemId'    => 'mikrotik_api',
            'tooltip'   => 'Mikrotik API',
            'disabled' 	=> true,
            'ui'        => $this->btnUiEdit
        ]; 
         
        $this->btnConfigCall = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnCog'), 
            'scale'     => $this->scale,
            'itemId'    => 'config',
            'tooltip'   => 'Config Call',
            'ui'        => 'default'       
        ]; 
        
        $this->btnKickActive = [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnKick'),
            'scale'     => $this->scale,
            'itemId'    => 'kick',
            'ui'        => 'button-red',
            'tooltip'=> __('Kick user off')
        ];
        
        $this->btnCloseOpen = [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnClose'),
            'scale'     => $this->scale,
            'itemId'    => 'close',
            'ui'        => 'button-orange',
            'tooltip'   => __('Close session')
        ];
                                
    }
       
  
}
