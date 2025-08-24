<?php

$config = [];
$config['RbaNas'] = [
    'admin'     => ['*'],
    'view'      => [
        'testMikrotik',
        'exportCsv',
        'index',
        'add',
        'view',
        'edit',
        //'delete',
               
        //Buttons
        'btnGraph'        
    ],
    'granular'  => [
        'testMikrotik',
        'exportCsv',
        'index',
        'add',
        'view',
        'edit',
        'delete',
               
        //Buttons
        'btnGraph'
    ],
    'logActions'    => true,    //Flag to set if we want to actions logged
    'logExcludes'   => [
        'index'
    ]
];

return $config;

?>

