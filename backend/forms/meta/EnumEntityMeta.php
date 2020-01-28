<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use steroids\gii\forms\EnumItemEntity;
use \Yii;
use yii\db\ActiveQuery;

/**
 * @property-read EnumItemEntity[] $items
 */
abstract class EnumEntityMeta extends FormModel
{
    public $namespace;
    public $name;
    public $isCustomValues;

    public function rules()
    {
        return [
            [['namespace', 'name'], 'string', 'max' => 255],
            [['namespace', 'name'], 'required'],
            ['isCustomValues', 'boolean'],
        ];
    }

    public static function meta()
    {
        return [
            'namespace' => [
                'label' => Yii::t('steroids', 'Namespace'),
                'required' => true
            ],
            'name' => [
                'label' => Yii::t('steroids', 'Class name'),
                'required' => true
            ],
            'isCustomValues' => [
                'label' => Yii::t('steroids', 'Use custom values'),
                'appType' => 'boolean'
            ]
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getItems()
    {
        return $this->hasMany(EnumItemEntity::class);
    }
}
