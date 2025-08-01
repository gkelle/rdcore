<?php

$config = [];
$config['RbaVouchers'] = [
    'admin'     => ['*'],
    'view'      => [
        'exportCsv',
        'exportPdf',
        'pdfView',
        'index',
        //'add',
        'viewBasicInfo',
        //'editBasicInfo',
        //'bulkDelete',
        //'delete',
        'privateAttrIndex',
        //'privateAttrAdd',
        //'privateAttrEdit',
        //'privateAttrDelete',
        //'changePassword',
        'emailVoucherDetails',
        'pdfExportSettings'
    ],
    'granular'  => [
        'exportCsv',
        'exportPdf',
        'pdfView',
        'index',
        'add',
        'viewBasicInfo',
        'editBasicInfo',
        'bulkDelete',
        'delete',
        'privateAttrIndex',
        'privateAttrAdd',
        'privateAttrEdit',
        'privateAttrDelete',
        'changePassword',
        'emailVoucherDetails',
        'pdfExportSettings'
    ],
    'logActions'    => true,    //Flag to set if we want to actions logged
    'logExcludes'   => [
        'index'
    ]
];

return $config;

?>

