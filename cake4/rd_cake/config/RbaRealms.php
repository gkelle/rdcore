<?php

$config = [];
$config['RbaRealms'] = [
    'admin'     => ['*'],
    'view'      => [
        'indexCloud',
        //'exportCsv',
        'index',
        //'add',
        //'edit',
        'view',
        //'delete',
        //'uploadLogo',
        'listRealmsForDynamicClientCloud', //Called by DynamicClient Edit screen
        'viewRealmsForDynamicClient', //Called by DynamicClient Edit screen
        //'editRealmsForDynamicClient', //Called by DynamicClient Edit screen
        //'updateDynamicClientRealm', //Called by DynamicClient Edit screen
        'listRealmsForNasCloud', //Called by Nas Edit Screen
        //'updateNasRealm', //Called by Nas Edit Screen
        
        //Buttons
        'btnGraph',
        //'btnLogo',
        //'btnVlan',
        //'btnPmk'       
    ],
    'granular'  => [
        'indexCloud',
        'exportCsv',
        'index',
        'add',
        'edit',
        'view',
        'delete',
        'uploadLogo',
        'listRealmsForDynamicClientCloud', //Called by DynamicClient Edit screen
        'viewRealmsForDynamicClient', //Called by DynamicClient Edit screen
        'editRealmsForDynamicClient', //Called by DynamicClient Edit screen
        'updateDynamicClientRealm', //Called by DynamicClient Edit screen
        'listRealmsForNasCloud', //Called by Nas Edit Screen
        'updateNasRealm', //Called by Nas Edit Screen
        
        //Buttons
        'btnGraph',
        //'btnLogo',
        //'btnVlan',
        //'btnPmk'
    ],
    'logActions'    => true,    //Flag to set if we want to actions logged
    'logExcludes'   => [
        'index'
    ]
];

return $config;

?>

