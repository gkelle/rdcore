<?php

$config = [];
$config['RbaProfileComponents'] = [
    'admin'     => ['*'],
    'view'      => [
        'indexCombo',
        'indexDataView',
        'index',     
        'indexComp',
        //'addComp',
        //'editComp',
        //'deleteComp',
        //'add',
        //'edit',
        //'delete'     
    ],
    'granular'  => [
        'indexCombo',
        'indexDataView',
        'index',     
        'indexComp',
        'addComp',
        'editComp',
        'deleteComp',
        'add',
        'edit',
        'delete'
    ],
    'logActions'    => true,    //Flag to set if we want to actions logged
    'logExcludes'   => [
        'index'
    ]
];

return $config;

?>

