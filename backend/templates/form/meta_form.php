<?php

namespace app\views;

use steroids\gii\forms\BackendFormEntity;

/* @var $formEntity BackendFormEntity */

$useClasses = [];
if (count($formEntity->publicRelationItems) > 0) {
    $useClasses[] = 'yii\db\ActiveQuery';
}
foreach ($formEntity->publicRelationItems as $relationEntity) {
    $useClasses[] = $relationEntity->relationModel;
}
$rules = $formEntity->renderRules($useClasses);
$behaviors = $formEntity->renderBehaviors('            ', $useClasses);
$meta = $formEntity->renderMeta('        ', $useClasses);

echo "<?php\n";
?>

namespace <?= $formEntity->getNamespace() ?>\meta;

use steroids\core\base\FormModel;
<?php foreach (array_unique($useClasses) as $relationClassName) { ?>
use <?= $relationClassName ?>;
<?php } ?>

abstract class <?= $formEntity->name ?>Meta extends FormModel
{
<?php foreach ($formEntity->publicAttributeItems as $attributeEntity) { ?>
    public <?= $attributeEntity->getPropertyType() ?> $<?= $attributeEntity->name ?>;
<?php } ?>

<?php if (count($formEntity->getProperties()) > 0) { ?>
<?php foreach ($formEntity->getProperties() as $key => $value) { ?>
    public <?= $value ? 'array' : '' ?> $<?= $key ?><?= $value !== null ? ' = ' . $value : '' ?>;
<?php } ?>

<?php } ?>
<?php if (!empty($rules)) { ?>
    public function rules()
    {
        return [<?= "\n            " . implode(",\n            ", $rules) . ",\n        " ?>];
    }
<?php } ?>
<?php if (!empty($behaviors)) { ?>

    public function behaviors()
    {
        return [
            <?= $behaviors ?>
        ];
    }
<?php } ?>
<?php foreach ($formEntity->publicRelationItems as $relationEntity) { ?>

    /**
    * @return ActiveQuery
    */
    public function get<?= ucfirst($relationEntity->name) ?>()
    {
        return $this-><?= $relationEntity->isHasOne ? 'hasOne' : 'hasMany' ?>(<?= $relationEntity->relationModelEntry->name ?>::class);
    }
<?php } ?>

    public static function meta()
    {
        return <?= $meta ?>;
    }
}
