<?php

$config = [];
$config['RbaProfiles'] = [
    'admin'     => ['*'],
    'view'      => [
        'indexAp',
        'index',
        //'manageComponents'
        //'delete',
        //'simpleAdd',
        //'simpleEdit',
        'simpleView',
        'fupView',
        //'fupEdit',
      
        //Buttons
        //'btnProfileComponents',
    ],
    'granular'  => [
        'indexAp',
        'index',
        'manageComponents',
        //'delete',
        'simpleAdd',
        //'simpleEdit',
        'simpleView',
        'fupView',
        'fupEdit',
      
        //Buttons
        'btnProfileComponents',
    ],
    'logActions'    => true,    //Flag to set if we want to actions logged
    'logExcludes'   => [
        'index'
    ]
];

return $config;

?>

