<?php

$config = [];
$config['RbaNas'] = [
    'admin'     => ['*'],
    'view'      => [
        
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

