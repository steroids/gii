<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use yii\db\ActiveQuery;
use steroids\gii\forms\BackendModelAttributeEntity;
use steroids\gii\forms\BackendModelRelationEntity;
use steroids\gii\enums\MigrateMode;
use \Yii;

abstract class BackendModelEntityMeta extends FormModel
{
    public $namespace;
    public $name;
    public $tableName;
    public $migrateMode;
    public $queryModel;

    public function rules()
    {
        return [
            [['namespace', 'name', 'tableName', 'queryModel'], 'string', 'max' => 255],
            [['namespace', 'name'], 'required'],
            ['migrateMode', 'in', 'range' => MigrateMode::getKeys()],
        ];
    }

    /**
    * @return ActiveQuery
    */
    public function getAttributeItems()
    {
        return $this->hasMany(BackendModelAttributeEntity::class);
    }

    /**
    * @return ActiveQuery
    */
    public function getRelationItems()
    {
        return $this->hasMany(BackendModelRelationEntity::class);
    }

    public static function meta()
    {
        return [
            'namespace' => [
                'label' => Yii::t('steroids', 'Namespace'),
                'isRequired' => true
            ],
            'name' => [
                'label' => Yii::t('steroids', 'Class name'),
                'isRequired' => true
            ],
            'tableName' => [
                'label' => Yii::t('steroids', 'Table name')
            ],
            'migrateMode' => [
                'label' => Yii::t('steroids', 'Migration mode'),
                'appType' => 'enum',
                'enumClassName' => MigrateMode::class
            ],
            'queryModel' => [
                'label' => Yii::t('steroids', 'Query model'),
                'hint' => Yii::t('steroids', 'Set for SearchModel, skip for FormModel')
            ],
        ];
    }
}
