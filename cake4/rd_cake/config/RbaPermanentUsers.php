<?php

$config = [];
$config['RbaPermanentUsers'] = [
    'admin'     => ['*'],
    'view'      => [
      //'exportCsv',
        'index',
      //'add',
      //'import',
      //'delete',
      //'viewBasicInfo',
      //'editBasicInfo',
      //'viewPersonalInfo',
      //'editPersonalInfo',
      //'privateAttrIndex',
      //'privateAttrAdd',
      //'privateAttrEdit',
      //'privateAttrDelete',
      //'restrictListOfDevices',
      //'autoMacOnOff',
      //'viewPassword',
      //'changePassword',
      //'emailUserDetails',
      //'enableDisable',
      
        //Buttons
        //'btnRadius',
        //'btnGraph',
        //'btnByod',
        //'btnTopup',
    ],
    'granular'  => [
        'exportCsv',
        'index',
        'add',
        'import',
        'delete',
        'viewBasicInfo',
        'editBasicInfo',
        'viewPersonalInfo',
        'editPersonalInfo',
        'privateAttrIndex',
        'privateAttrAdd',
        'privateAttrEdit',
        //'privateAttrDelete',
        'restrictListOfDevices',
        'autoMacOnOff',
        'viewPassword',
        'changePassword',
        'emailUserDetails',
        'enableDisable',
        
        //Buttons
        'btnRadius',
        'btnGraph',
        //'btnByod',
        //'btnTopup',
    ],
    'logActions'    => true,    //Flag to set if we want to actions logged
    'logExcludes'   => [
        'index'
    ]
];

return $config;

?>

