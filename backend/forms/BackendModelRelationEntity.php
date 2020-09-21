<?php

namespace steroids\gii\forms;

use steroids\core\base\Model;
use steroids\core\helpers\ClassFile;
use steroids\gii\enums\RelationType;
use steroids\gii\forms\meta\BackendModelRelationEntityMeta;
use yii\base\InvalidConfigException;
use yii\db\ActiveQuery;

/**
 * @property-read boolean $isHasOne
 * @property-read boolean $isHasMany
 * @property-read boolean $isManyMany
 * @property-read BackendModelEntity $relationModelEntry
 * @property-read BackendModelAttributeEntity $viaRelationAttributeEntry
 * @property-read BackendModelAttributeEntity $viaSelfAttributeEntry
 * @property-read bool $isProtected
 */
class BackendModelRelationEntity extends BackendModelRelationEntityMeta
{
    /**
     * @var BackendModelEntity
     */
    public $modelEntity;

    /**
     * @param BackendModelEntity $entity
     * @return static[]
     * @throws \ReflectionException
     */
    public static function findAll($entity)
    {
        /** @var Model $className */
        $className = $entity->getClassName();

        try {
            $modelInstance = new $className();
        } catch (InvalidConfigException $e) {
            // Check no table
            return [];
        }

        $modelInfo = (new \ReflectionClass($className));
        $parentInfo = $modelInfo->getParentClass();

        if ($modelInfo->getShortName() . 'Meta' !== $parentInfo->getShortName()) {
            return [];
        }

        $items = [];
        foreach ($parentInfo->getMethods() as $methodInfo) {
            $methodName = $methodInfo->name;

            // Check exists relation in meta class
            if (strpos($methodName, 'get') !== 0 || $methodInfo->class !== $parentInfo->getName()) {
                continue;
            }

            $activeQuery = $modelInstance->$methodName();
            if ($activeQuery instanceof ActiveQuery) {
                if ($activeQuery->multiple && $activeQuery->via) {
                    $items[] = new static([
                        'type' => RelationType::MANY_MANY,
                        'name' => lcfirst(substr($methodInfo->name, 3)),
                        'relationModel' => $activeQuery->modelClass,
                        'relationKey' => array_keys($activeQuery->link)[0],
                        'selfKey' => array_values($activeQuery->via->link)[0],
                        'viaTable' => $activeQuery->via->from[0],
                        'viaRelationKey' => array_values($activeQuery->link)[0],
                        'viaSelfKey' => array_keys($activeQuery->via->link)[0],
                        'modelEntity' => $entity,
                    ]);
                } elseif ($activeQuery->link) {
                    $items[] = new static([
                        'type' => $activeQuery->multiple ? RelationType::HAS_MANY : RelationType::HAS_ONE,
                        'name' => lcfirst(substr($methodInfo->name, 3)),
                        'relationModel' => $activeQuery->modelClass,
                        'relationKey' => array_keys($activeQuery->link)[0],
                        'selfKey' => array_values($activeQuery->link)[0],
                        'modelEntity' => $entity,
                    ]);
                } else {
                    $items[] = new static([
                        'type' => $activeQuery->multiple ? RelationType::HAS_MANY : RelationType::HAS_ONE,
                        'name' => lcfirst(substr($methodInfo->name, 3)),
                        'relationModel' => $activeQuery->modelClass,
                        'modelEntity' => $entity,
                    ]);
                }
            }
        }

        return $items;
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return array_merge(
            array_diff($this->attributes(), ['modelEntity']),
            ['isProtected']
        );
    }

    public function rules()
    {
        return array_merge(parent::rules(), [
            [['relationModel'], 'filter', 'filter' => function ($value) {
                return is_string($value) ? rtrim($value, '\\') : $value;
            }],
        ]);
    }

    public function getIsHasOne()
    {
        return $this->type === RelationType::HAS_ONE;
    }

    public function getIsHasMany()
    {
        return $this->type === RelationType::HAS_MANY;
    }

    public function getIsManyMany()
    {
        return $this->type === RelationType::MANY_MANY;
    }

    /**
     * @return BackendModelEntity|null
     */
    public function getRelationModelEntry()
    {
        return BackendModelEntity::findOne(ClassFile::createByClass($this->relationModel, ClassFile::TYPE_MODEL));
    }

    /**
     * @return BackendModelAttributeEntity|null
     */
    public function getViaRelationAttributeEntry()
    {
        return $this->relationModelEntry->getAttributeEntity($this->viaRelationKey);
    }

    /**
     * @return BackendModelAttributeEntity|null
     */
    public function getViaSelfAttributeEntry()
    {
        return $this->relationModelEntry->getAttributeEntity($this->viaSelfKey);
    }

    public function getIsProtected()
    {
        /*$info = new \ReflectionClass($this->modelEntity->getClassName());
        $parentClassName = $info->getParentClass()->getParentClass()->name;

        if (method_exists($parentClassName, 'meta')) {
            $meta = $parentClassName::meta();
            return ArrayHelper::keyExists($this->name, $meta);
        }*/
        // TODO

        return false;
    }
}
