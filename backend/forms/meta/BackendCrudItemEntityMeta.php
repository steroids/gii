<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use \Yii;

abstract class BackendCrudItemEntityMeta extends FormModel
{
    public ?string $name = null;
    public ?bool $showInForm = null;
    public ?bool $showInTable = null;
    public ?bool $showInView = null;
    public ?bool $isSortable = null;

    public function rules()
    {
        return [
            ...parent::rules(),
            ['name', 'string', 'max' => 255],
            [['showInForm', 'showInTable', 'showInView', 'isSortable'], 'steroids\\core\\validators\\ExtBooleanValidator'],
        ];
    }

    public static function meta()
    {
        return [
            'name' => [
                'label' => Yii::t('steroids', 'Name')
            ],
            'showInForm' => [
                'label' => Yii::t('steroids', 'Show in Form'),
                'appType' => 'boolean'
            ],
            'showInTable' => [
                'label' => Yii::t('steroids', 'Show in Table'),
                'appType' => 'boolean'
            ],
            'showInView' => [
                'label' => Yii::t('steroids', 'Show in View'),
                'appType' => 'boolean'
            ],
            'isSortable' => [
                'label' => Yii::t('steroids', 'Sortable'),
                'appType' => 'boolean',
                'isSortable' => false
            ]
        ];
    }
}
