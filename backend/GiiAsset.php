<?php

namespace steroids\gii;

use yii\web\AssetBundle;

class GiiAsset extends AssetBundle
{
    public function init()
    {
        parent::init();

        $this->sourcePath = dirname(__DIR__) . '/assets';
    }

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
        'bundle-index.ts',
    ];
}
