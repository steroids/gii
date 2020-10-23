import Enum from '@steroidsjs/core/base/Enum';

export default class ClassType extends Enum {

    static MODULE = 'module';
    static MODEL = 'model';
    static FORM = 'form';
    static ENUM = 'enum';
    static CRUD = 'crud';
    static SCHEMA = 'schema';

    static getKeys() {
        return [
            this.MODULE,
            this.MODEL,
            this.FORM,
            this.ENUM,
            this.CRUD,
            this.SCHEMA,
        ];
    }

}
