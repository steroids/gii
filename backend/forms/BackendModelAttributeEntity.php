<?php

namespace steroids\gii\forms;

use steroids\core\base\Model;
use steroids\core\types\AddressType;
use steroids\core\types\AutoTimeType;
use steroids\core\types\BooleanType;
use steroids\core\types\CategorizedStringType;
use steroids\core\types\DateTimeType;
use steroids\core\types\DateType;
use steroids\core\types\DoubleType;
use steroids\core\types\EmailType;
use steroids\core\types\EnumListType;
use steroids\core\types\EnumType;
use steroids\core\types\FilesType;
use steroids\core\types\FileType;
use steroids\core\types\HtmlType;
use steroids\core\types\IntegerType;
use steroids\core\types\MoneyType;
use steroids\core\types\MoneyWithCurrencyType;
use steroids\core\types\PasswordType;
use steroids\core\types\PhoneType;
use steroids\core\types\PrimaryKeyType;
use steroids\core\types\RangeType;
use steroids\core\types\RelationType;
use steroids\core\types\ScheduleType;
use steroids\core\types\SizeType;
use steroids\core\types\StringType;
use steroids\core\types\TextType;
use steroids\core\types\TimeType;
use steroids\gii\forms\meta\BackendModelAttributeEntityMeta;
use steroids\gii\traits\CustomPropertyTrait;
use Yii;
use yii\helpers\ArrayHelper;

/**
 * @property-read bool $isProtected
 */
class BackendModelAttributeEntity extends BackendModelAttributeEntityMeta
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
        switch ($this->appType) {
            case AddressType::ATTRIBUTE_NAME:
            case AutoTimeType::ATTRIBUTE_NAME:
            case CategorizedStringType::ATTRIBUTE_NAME:
            case DateTimeType::ATTRIBUTE_NAME:
            case DateType::ATTRIBUTE_NAME:
            case EmailType::ATTRIBUTE_NAME:
            case HtmlType::ATTRIBUTE_NAME:
            case PasswordType::ATTRIBUTE_NAME:
            case PhoneType::ATTRIBUTE_NAME:
            case ScheduleType::ATTRIBUTE_NAME:
            case StringType::ATTRIBUTE_NAME:
            case TextType::ATTRIBUTE_NAME:
            case TimeType::ATTRIBUTE_NAME:
                return 'string';
            case DoubleType::ATTRIBUTE_NAME:
            case MoneyType::ATTRIBUTE_NAME:
            case MoneyWithCurrencyType::ATTRIBUTE_NAME:
                return 'float';
            case BooleanType::ATTRIBUTE_NAME:
                return 'bool';
            case IntegerType::ATTRIBUTE_NAME:
            case SizeType::ATTRIBUTE_NAME:
            case PrimaryKeyType::ATTRIBUTE_NAME:
            case FileType::ATTRIBUTE_NAME:
                return 'int';
            case EnumListType::ATTRIBUTE_NAME:
            case RangeType::ATTRIBUTE_NAME:
            case EnumType::ATTRIBUTE_NAME:
            case FilesType::ATTRIBUTE_NAME:
            case RelationType::ATTRIBUTE_NAME:
                return 'array';
            default:
                return null;
        }
    }

    /**
     * @param BackendModelEntity $entity
     * @param string $classType
     * @return static[]
     * @throws \ReflectionException
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
            $isPostgres = Yii::$app->db->getSchema() instanceof \yii\db\pgsql\Schema;
            $notNull = !$isPostgres && $this->isRequired ? '->notNull()' : '';
            $defaultValue = !$isPostgres && $this->defaultValue !== null && $this->defaultValue !== ''
                ? '->defaultValue(' . (preg_match('/^[0-9]+$/', $this->defaultValue) ? $this->defaultValue : "'" . $this->defaultValue . "'") . ')'
                : '';

            if (!$isPostgres && $parts[0] === 'boolean') {
                $notNull = '->notNull()';
                $defaultValue = '->defaultValue(0)';
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
