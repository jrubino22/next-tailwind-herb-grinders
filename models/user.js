import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        phoneNum: {type: String, required: false},
        password: { type: String, required: true },
        registeredUser: {type: Boolean, required: true, default: false},
        isAdmin: {type: Boolean, required: true, default: false},
        address: [
            {
              fullName: { type: String, required: true },
              addressLine1: { type: String },
              addressLine2: { type: String, required: false },
              city: { Type: String },
              state: { Type: String },
              zip: { Type: String },
              country: {Type: String},
              phoneNum: { Type: String },
            },
          ],
    }, {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;