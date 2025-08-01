<?php

$config = [];
$config['RbaRadaccts'] = [
    'admin'     => ['*'],
    'view'      => [
        'exportCsv',
        'indexWithSpan',
        'index',
        //'delete',
        'kickActiveUsername',
        //'kickActive',
        //'closeOpen',
    ],
    'granular'  => [
        'exportCsv',
        'indexWithSpan',
        'index',
        //'delete',
        'kickActiveUsername',
        'kickActive',
        //'closeOpen',
      
    ],
    'logActions'    => true,    //Flag to set if we want to actions logged
    'logExcludes'   => [
        'index'
    ]
];

return $config;

?>

