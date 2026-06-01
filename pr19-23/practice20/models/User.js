const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number, required: false }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


userSchema.plugin(AutoIncrement, { inc_field: 'id' });


userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        
        delete ret._id;
        delete ret.__v;
        
        
        if (ret.created_at) {
            ret.created_at = Math.floor(ret.created_at.getTime() / 1000);
        }
        if (ret.updated_at) {
            ret.updated_at = Math.floor(ret.updated_at.getTime() / 1000);
        }
        
        return ret;
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
