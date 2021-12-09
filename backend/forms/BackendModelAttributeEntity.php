<?php

namespace steroids\gii\forms;

use steroids\core\base\Model;
use steroids\core\interfaces\IGiiModelAttribute;
use steroids\gii\forms\meta\BackendModelAttributeEntityMeta;
use steroids\gii\traits\CustomPropertyTrait;
use Yii;
use yii\db\pgsql\Schema;
use yii\helpers\ArrayHelper;

/**
 * @property-read bool $isProtected
 */
class BackendModelAttributeEntity extends BackendModelAttributeEntityMeta implements IGiiModelAttribute
{
    use CustomPropertyTrait;

    /**
     * @var BackendModelEntity
     */
    public $modelEntity;

    /**
     * @var string
     */
    public $customMigrationColumnType;

    /**
     * Return property type depends by appType
     *
     * @return string|null
     */
    public function getPropertyType()
    {
        return Yii::$app->types->getType($this->appType)->getPhpType();
    }

    /**
     * @param BackendModelEntity $entity
     * @return static[]
     */
    public static function findAll($entity)
    {
        /** @var Model $className */
        $className = $entity->getClassName();

        /** @var Model $className */
        $items = [];
        foreach ($className::meta() as $attribute => $item) {
            // Legacy support
            if (isset($item['required'])) {
                $item['isRequired'] = true;
                unset($item['required']);
            }

            $items[] = new static(array_merge(
                [
                    'name' => $attribute,
                    'prevName' => $attribute,
                    'appType' => 'string',
                    'modelEntity' => $entity,
                ],
                $item
            ));
        }
        return $items;
    }

    /**
     * @param string $dbType
     * @return array|null
     */
    public static function parseDbType($dbType)
    {
        return preg_match('/^([^(]+)(\(([^)]+)\))?/', $dbType, $matches)
            ? count($matches) > 2 ? [$matches[1], $matches[3]] : [$matches[1]]
            : null;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getCustomProperty($name)
    {
        return ArrayHelper::getValue($this, $name);
    }

    public function isModelHasOneRelationExists($relationName)
    {
        $relation = $this->modelEntity->getRelationEntity($relationName);
        return $relation && $relation->isHasOne;
    }

    public function onUnsafeAttribute($name, $value)
    {
        $this->setCustomProperty($name, $value);
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return array_merge(
            array_diff($this->attributes(), ['modelEntity', 'customMigrationColumnType']),
            array_keys($this->getCustomProperties()),
            ['isProtected']
        );
    }

    public function rules()
    {
        return array_merge(
            [
                ['example', 'filter', 'filter' => function ($value) {
                    if (is_bool($value)) {
                        return $value ? 'true' : 'false';
                    }
                    return $value ? (string)$value : '';
                }],
            ],
            parent::rules()
        );
    }

    /**
     * Formats:
     *  - string
     *  - string NOT NULL
     *  - string(32)
     *  - varchar(255) NOT NULL
     * @return string|null
     */
    public function getDbType()
    {
        return Yii::$app->types->getType($this->appType)->giiDbType($this);
    }

    /**
     * @return string
     */
    public function getPhpDocType()
    {
        static $typeMap = [
            'bigint' => 'integer',
            'integer' => 'integer',
            'smallint' => 'integer',
            'boolean' => 'boolean',
            'float' => 'double',
            'double' => 'double',
            'binary' => 'resource',
        ];

        $dbType = $this->getDbType();
        $type = $dbType ? (array)self::parseDbType($dbType)[0] : null;
        return ArrayHelper::getValue($typeMap, $type, 'string');
    }

    public function renderMigrationColumnType()
    {
        if ($this->customMigrationColumnType !== null) {
            return $this->customMigrationColumnType;
        }

        $map = [
            'pk' => 'primaryKey',
            'bigpk' => 'bigPrimaryKey',
            'char' => 'char',
            'string' => 'string',
            'text' => 'text',
            'smallint' => 'smallInteger',
            'integer' => 'integer',
            'bigint' => 'bigInteger',
            'float' => 'float',
            'double' => 'double',
            'decimal' => 'decimal',
            'datetime' => 'dateTime',
            'timestamp' => 'timestamp',
            'time' => 'time',
            'date' => 'date',
            'binary' => 'binary',
            'boolean' => 'boolean',
            'money' => 'money',
        ];
        $dbType = $this->getDbType() ?: 'string';
        $parts = self::parseDbType($dbType);

        if (isset($map[$parts[0]])) {
            $arguments = count($parts) > 1 ? implode(', ', array_slice($parts, 1)) : '';

            // 'required' property is handled separately for Postgres
            $isPostgres = Yii::$app->db->getSchema() instanceof Schema;
            $notNull = !$isPostgres && $this->isRequired ? '->notNull()' : '';
            $defaultValue = !$isPostgres && $this->defaultValue !== null && $this->defaultValue !== ''
                ? '->defaultValue(' . (preg_match('/^[0-9]+$/', $this->defaultValue) ? $this->defaultValue : "'" . $this->defaultValue . "'") . ')'
                : '';

            if (!$isPostgres && $parts[0] === 'boolean') {
                $notNull = '->notNull()';
                $defaultValue = '->defaultValue(false)';
            }

            return '$this->' . $map[$parts[0]] . '(' . $arguments . ')' . $notNull . $defaultValue;
        } else {
            return "'$dbType'";
        }
    }

    public function getIsProtected()
    {
        return false;
    }

}
