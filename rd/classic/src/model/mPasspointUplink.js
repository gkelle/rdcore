Ext.define('Rd.model.mPasspointUplink', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',       type: 'int'     },
         {name: 'name',     type: 'string'  },
         {name: 'update',   type: 'bool'    },
         {name: 'delete',   type: 'bool'    }
    ]
});
