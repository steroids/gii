<?php

namespace app\views;

use steroids\gii\forms\BackendFormEntity;

/* @var $formEntity BackendFormEntity */

$useClasses = [];
if (count($formEntity->publicRelationItems) > 0) {
    $useClasses[] = 'yii\db\ActiveQuery';
}
$rules = $formEntity->renderRules($useClasses);
$behaviors = $formEntity->renderBehaviors('            ', $useClasses);
$sortFields = $formEntity->renderSortFields('        ');
$meta = $formEntity->renderMeta('        ', $useClasses);

echo "<?php\n";
?>

namespace <?= $formEntity->getNamespace() ?>\meta;

use steroids\core\base\SearchModel;
<?php foreach (array_unique($useClasses) as $relationClassName) { ?>
use <?= $relationClassName ?>;
<?php } ?>
use <?= $formEntity->queryModelEntity->getClassName() ?>;

abstract class <?= $formEntity->name ?>Meta extends SearchModel
{
<?php if (count($formEntity->publicAttributeItems) > 0) { ?>
<?php foreach ($formEntity->publicAttributeItems as $metaItem) { ?>
    public <?= $metaItem->getPropertyType() ?> $<?= $metaItem->name ?> = null;
<?php } ?>
<?php } ?>
<?php if (count($formEntity->getProperties()) > 0) { ?>
<?php foreach ($formEntity->getProperties() as $key => $value) { ?>
    public <?= $value ? 'array' : '' ?> $<?= $key ?><?= $value !== null ? ' = ' . $value : '' ?>;
<?php } ?>

<?php } ?>
<?php if (!empty($rules)) { ?>

    public function rules()
    {
        return [
            ...parent::rules(),
            <?= implode(",\n            ", $rules) . ",\n" ?>
        ];
    }
<?php } ?>
<?php if (!empty($behaviors)) { ?>

    public function behaviors()
    {
        return [
            ...parent::behaviors(),
            <?= $behaviors ?>
        ];
    }
<?php } ?>
<?php if (!empty($sortFields)) { ?>

    public function sortFields()
    {
        return <?= $sortFields ?>;
    }
<?php } ?>

    public function createQuery()
    {
        return <?= $formEntity->queryModelEntity->name ?>::find();
    }
<?php foreach ($formEntity->publicRelationItems as $relationEntity) { ?>

    /**
    * @return ActiveQuery
    */
    public function get<?= ucfirst($relationEntity->name) ?>()
    {
        return $this-><?= $relationEntity->type ?>(<?= $relationEntity->relationModelEntry->name ?>::class);
    }
<?php } ?>

    public static function meta()
    {
        return <?= $meta ?>;
    }
}
