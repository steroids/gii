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
 * @property-read BackendModelEntity $queryModelEntity
 */
class BackendFormEntity extends BackendModelEntity implements EntityInterface
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

        return static::findOrCreate($classFile);
    }

    /**
     * @param ClassFile $classFile
     * @return static
     * @throws \ReflectionException
     */
    public static function findOrCreate(ClassFile $classFile)
    {
        $entity = new static([
            'classFile' => $classFile,
            'namespace' => $classFile->namespace,
            'name' => $classFile->name,
        ]);

        /** @var SearchModel $searchModel */
        $className = $classFile->className;
        if (class_exists($className)) {
            $searchModel = new $className();

            if (method_exists($searchModel, 'createQuery')) {
                $query = $searchModel->createQuery();
                if (property_exists(get_class($query), 'modelClass')) {
                    $entity->queryModel = $query->modelClass;
                }
            }

            $entity->populateRelation('relationItems', BackendFormRelationEntity::findAll($entity));
            $entity->populateRelation('attributeItems', BackendFormAttributeEntity::findAll($entity));

            if (method_exists($searchModel, 'sortFields')) {
                $sortFields = $searchModel->sortFields();
                foreach ($entity->attributeItems as $item) {
                    $item->isSortable = in_array($item->name, $sortFields);
                }
            }
        }

        return $entity;
    }

    public function save()
    {
        if ($this->validate()) {
            // Lazy create module
            BackendModuleEntity::autoCreateForEntity($this);

            GiiHelper::renderFile($this->queryModel ? 'form/meta_search' : 'form/meta_form', $this->classFile->metaPath, [
                'formEntity' => $this,
            ]);
            \Yii::$app->session->addFlash('success', 'Meta info form ' . $this->classFile->name . 'Meta update');

            // Create model, if not exists
            if (!file_exists($this->classFile->path)) {
                GiiHelper::renderFile('form/form', $this->classFile->path, [
                    'formEntity' => $this,
                ]);
                \Yii::$app->session->addFlash('success', 'Added form ' . $this->classFile->name);
            }

            return true;
        }
        return false;
    }

    public function getClassName()
    {
        return $this->classFile->className;
    }

    public function renderRules(&$useClasses = [])
    {
        return BackendModelEntity::exportRules($this->publicAttributeItems, $this->publicRelationItems, $useClasses);
    }

    /**
     * @return BackendModelEntity|null
     */
    public function getQueryModelEntity()
    {
        return $this->queryModel ? BackendModelEntity::findOne(ClassFile::createByClass($this->queryModel), ClassFile::TYPE_MODEL) : null;
    }

    /**
     * @return ActiveQuery
     */
    public function getAttributeItems()
    {
        return $this->hasMany(BackendFormAttributeEntity::class);
    }

    /**
     * @return ActiveQuery
     */
    public function getRelationItems()
    {
        return $this->hasMany(BackendFormRelationEntity::class);
    }
}
