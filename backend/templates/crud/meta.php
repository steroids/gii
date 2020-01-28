<?php

namespace app\views;

use steroids\gii\generators\crud\CrudGenerator;
use steroids\gii\models\ControllerClass;
use yii\web\View;

/* @var $crudEntity ControllerClass */

$useClasses = [];
$meta = $crudEntity->metaClass->renderMeta('        ', $useClasses);

echo "<?php\n";
?>

namespace <?= $crudEntity->metaClass->namespace ?>\meta;

use Yii;
use extpoint\yii2\base\CrudController;
<?php foreach (array_unique($useClasses) as $relationClassName) { ?>
use <?= $relationClassName ?>;
<?php } ?>

abstract class <?= $crudEntity->metaClass->name ?> extends CrudController
{
    public static function meta()
    {
        return <?= $meta ?>;
    }
}
