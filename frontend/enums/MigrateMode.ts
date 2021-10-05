import Enum from '@steroidsjs/core/base/Enum';

export default class MigrateMode extends Enum {

    static CREATE = 'create'
    static UPDATE = 'update'
    static NONE = 'none'

    static getKeys() {
        return [
            this.CREATE,
            this.UPDATE,
            this.NONE,
        ];
    }

}
