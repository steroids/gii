<?php

namespace app\views;

use steroids\gii\forms\BackendCrudEntity;
use yii\web\View;

/**
 * @var View $this
 * @var BackendCrudEntity $crudEntity
 */

$useClasses = [];
$metaControllerName = $crudEntity->getControllerName() . 'MetaController';
$searchClassName = null;
$modelClassName = null;

if ($crudEntity->searchModel) {
    $separateTmpAr = explode('\\',$crudEntity->searchModel);
    $searchClassName = array_pop($separateTmpAr);
}

if ($crudEntity->queryModel) {
    $separateTmpAr = explode('\\',$crudEntity->queryModel);
    $modelClassName = array_pop($separateTmpAr);
}

echo "<?php\n";
?>

namespace <?= $crudEntity->classFile->namespace ?>\meta;

use <?= $crudEntity->queryModel ?>;
use <?= $crudEntity->searchModel ?>;
use steroids\core\base\CrudApiController;
<?php foreach (array_unique($useClasses) as $relationClassName): ?>
use <?= $relationClassName ?>;
<?php endforeach; ?>

abstract class <?= $metaControllerName ?> extends CrudApiController
{
<?php if($modelClassName): ?>
    public static $modelClass = <?= $modelClassName ?>::class;
<?php endif; ?>
<?php if($searchClassName): ?>
    public static $searchModelClass = <?= $searchClassName ?>::class;
<?php endif; ?>
}
