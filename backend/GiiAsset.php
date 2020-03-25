<?php

namespace steroids\gii;

use yii\web\AssetBundle;

class GiiAsset extends AssetBundle
{
    /**
     * {@inheritdoc}
     */
    public $sourcePath = '@steroids/gii/assets';

    /**
     * {@inheritdoc}
     */
    public $css = [
        'bundle-index.css',
    ];

    /**
     * {@inheritdoc}
     */
    public $js = [
        'bundle-common.js',
        'bundle-index.js',
    ];
}
