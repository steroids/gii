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
$viewSchemaClassName = null;

if ($crudEntity->viewSchema) {
    $separateTmpAr = explode('\\', $crudEntity->viewSchema);
    $viewSchemaClassName = array_pop($separateTmpAr);
}

if ($crudEntity->searchModel) {
    $separateTmpAr = explode('\\',$crudEntity->searchModel);
    $searchClassName = array_pop($separateTmpAr);
}

if ($crudEntity->queryModel) {
    $separateTmpAr = explode('\\',$crudEntity->queryModel);
    $modelClassName = array_pop($separateTmpAr);
}

$modelFields = [];
$modelFormFields = [];
$modelDetailFields = [];

if ($crudEntity->queryModel && !$crudEntity->searchModel) {
    $modelFields = $crudEntity->getModelFields(BackendCrudEntity::MODEL_FIELDS);
    $modelFormFields = $crudEntity->getModelFields(BackendCrudEntity::MODEL_FORM_FIELDS);
    $modelDetailFields = $crudEntity->getModelFields(BackendCrudEntity::MODEL_DETAIL_FIELDS);
}

echo "<?php\n";
?>

namespace <?= $crudEntity->classFile->namespace ?>\meta;

use <?= $crudEntity->queryModel ?>;
<?php if ($crudEntity->searchModel): ?>
use <?= $crudEntity->searchModel ?>;
<?php endif; ?>
<?php if ($crudEntity->viewSchema): ?>
use <?= $crudEntity->viewSchema ?>;
<?php endif; ?>
use steroids\core\base\CrudApiController;
<?php foreach (array_unique($useClasses) as $relationClassName): ?>
use <?= $relationClassName ?>;
<?php endforeach; ?>

abstract class <?= $metaControllerName ?> extends CrudApiController
{
<?php if ($modelClassName): ?>
    public static $modelClass = <?= $modelClassName ?>::class;
<?php endif; ?>
<?php if ($searchClassName): ?>
    public static $searchModelClass = <?= $searchClassName ?>::class;
<?php endif; ?>
<?php if ($viewSchemaClassName): ?>
    public static $viewSchema = <?= $viewSchemaClassName ?>::class;
<?php endif; ?>
<?php if ($crudEntity->actionControls): ?>

    /**
    * @return string[]
    */
    public static function controls()
    {
        return [
    <?php foreach ($crudEntity->actionControls as $control): ?>
        '<?= $control ?>',
    <?php endforeach; ?>
    ];
    }
<?php endif; ?>
<?php if ($modelFields): ?>

    /**
    * @return array
    */
    public function fields()
    {
        return [
    <?php foreach ($modelFields as $modelField): ?>
        '<?= $modelField ?>',
    <?php endforeach; ?>
    ];
    }
<?php endif; ?>
<?php if (!empty($modelFormFields)): ?>

    /**
    * @return array
    */
    public function formFields()
    {
        return [
    <?php foreach ($modelFormFields as $modelFormField): ?>
        '<?= $modelFormField ?>',
    <?php endforeach; ?>
    ];
    }
<?php endif; ?>
<?php if (!empty($modelDetailFields)): ?>

    /**
    * @return array
    */
    public function detailFields()
    {
        return [
    <?php foreach ($modelDetailFields as $modelDetailField): ?>
        '<?= $modelDetailField ?>',
    <?php endforeach; ?>
    ];
    }
<?php endif; ?>
}
