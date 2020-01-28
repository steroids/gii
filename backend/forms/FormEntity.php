<?php

namespace steroids\gii\forms;

use steroids\core\base\FormModel;
use steroids\core\base\SearchModel;
use steroids\core\helpers\ClassFile;
use steroids\gii\enums\ClassType;
use steroids\gii\GiiModule;
use steroids\gii\helpers\GiiHelper;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;

/**
 * @property-read ModelEntity $queryModelEntity
 */
class FormEntity extends ModelEntity
{
    /**
     * @var ClassFile
     */
    public $classFile;

    /**
     * @return static[]
     * @throws \ReflectionException
     */
    public static function findAll()
    {
        $items = [];
        foreach (GiiHelper::getModulesClasses(ClassType::FORM) as $classFile) {
            $items[] = static::findOne($classFile);
        }

        ArrayHelper::multisort($items, 'classFile.name');
        return $items;
    }

    public static function findOne(ClassFile $classFile)
    {
        $className = $classFile->className;
        if (!is_subclass_of($className, FormModel::class)) {
            return null;
        }

        $entity = new static([
            'classFile' => $classFile,
            'namespace' => $classFile->namespace,
            'name' => $classFile->name,
        ]);

        /** @var SearchModel $searchModel */
        $className = $classFile->className;
        $searchModel = new $className();

        if (method_exists($searchModel, 'createQuery')) {
            $query = $searchModel->createQuery();
            if (property_exists(get_class($query), 'modelClass')) {
                $entity->queryModel = $query->modelClass;
            }
        }

        $entity->populateRelation('relationItems', FormRelationEntity::findAll($entity));
        $entity->populateRelation('attributeItems', FormAttributeEntity::findAll($entity));

        if (method_exists($searchModel, 'sortFields')) {
            $sortFields = $searchModel->sortFields();
            foreach ($entity->attributeItems as $item) {
                $item->isSortable = in_array($item->name, $sortFields);
            }
        }

        return $entity;
    }

    public function save()
    {
        if ($this->validate()) {
            // Lazy create module
            ModuleEntity::findOrCreate($this->classFile->moduleId);

            GiiHelper::renderFile($this->queryModel ? 'form/meta_search' : 'form/meta_form', $this->getMetaPath(), [
                'formEntity' => $this,
            ]);
            \Yii::$app->session->addFlash('success', 'Meta info form ' . $this->classFile->name . 'Meta update');

            // Create model, if not exists
            if (!file_exists($this->getPath())) {
                GiiHelper::renderFile('form/form', $this->getPath(), [
                    'formEntity' => $this,
                ]);
                \Yii::$app->session->addFlash('success', 'Added form ' . $this->classFile->name);
            }

            if (GiiModule::getInstance()->generateJsMeta) {
                GiiHelper::renderFile('form/meta_js', $this->getMetaJsPath(), [
                    'formEntity' => $this,
                ]);
            }

            return true;
        }
        return false;
    }

    public function getClassName()
    {
        return $this->classFile->className;
    }

    public function getPath()
    {
        return "{$this->classFile->moduleDir}/forms/{$this->classFile->name}.php";
    }

    public function getMetaPath()
    {
        return "{$this->classFile->moduleDir}/forms/meta/{$this->classFile->name}Meta.php";
    }

    public function getMetaJsPath()
    {
        return "{$this->classFile->moduleDir}/forms/meta/{$this->classFile->name}Meta.js";
    }

    public function renderRules(&$useClasses = [])
    {
        return ModelEntity::exportRules($this->publicAttributeItems, $this->publicRelationItems, $useClasses);
    }

    /**
     * @return ModelEntity|null
     */
    public function getQueryModelEntity()
    {
        return $this->queryModel ? ModelEntity::findOne(ClassFile::createByClass($this->queryModel)) : null;
    }

    /**
     * @return ActiveQuery
     */
    public function getAttributeItems()
    {
        return $this->hasMany(FormAttributeEntity::class);
    }

    /**
     * @return ActiveQuery
     */
    public function getRelationItems()
    {
        return $this->hasMany(FormRelationEntity::class);
    }
}
