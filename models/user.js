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
              firstName: { type: String, required: true },
              lastName: { type: String, required: true },
              addressLine1: { type: String },
              addressLine2: { type: String, required: false },
              city: { type: String },
              state: { type: String },
              postalCode: { type: String },
              country: {type: String},
              phoneNum: { type: String },
            },
          ],
    }, {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;