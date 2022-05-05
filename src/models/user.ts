import { IUser, UserRole } from '@/types';
import { checkMultipleWords, trimmedStringType } from '@/utils';
import mongoose, { Document, Model, Query, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { DEFAULT_AVATAR } from '@/config';

export interface UserDocument extends IUser, Document {
    checkPasswordModified: (jwtIat: number) => boolean;
}

interface UserModel extends Model<UserDocument> {}

const userSchema: Schema<UserDocument, UserModel> = new Schema(
    {
        fullName: {
            ...trimmedStringType,
            required: [true, 'Full name field must be required!'],
            validate: {
                validator: (val: string) => checkMultipleWords(val, 2),
                message: 'Full name contains at least 2 words',
            },
        },
        email: {
            ...trimmedStringType,
            required: [true, 'Email field must be required!'],
            unique: true,
            validate: [validator.isEmail, 'Invalid email format!'],
        },
        password: {
            ...trimmedStringType,
            required: [true, 'Password field must be required!'],
            minlength: [
                6,
                'Password must have more or equal than 6 characters!',
            ],
        },
        phoneNumber: {
            ...trimmedStringType,
            validate: [validator.isMobilePhone, 'Invalid phone number format!'],
        },
        avatar: {
            ...trimmedStringType,
            validate: [validator.isURL, 'Invalid url!'],
            default: DEFAULT_AVATAR,
        },
        role: {
            type: String,
            enum: {
                values: Object.values(UserRole),
                message: `Role is either: ${Object.values(UserRole).join(
                    ', '
                )}`,
            },
            default: UserRole.PATIENT,
        },
        passwordModified: {
            type: Date,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.__v;
                delete ret.password;
                delete ret.passwordModified;
                delete ret.isDelete;

                doc.patient?.length > 0 && (ret.patient = doc.patient[0]);
                doc.doctor?.length > 0 && (ret.patient = doc.doctor[0]);

                return ret;
            },
        },
        toObject: { virtuals: true },
        id: false,
    }
);

userSchema.virtual('patient', {
    ref: 'Patient',
    foreignField: 'user',
    localField: '_id',
});

userSchema.virtual('doctor', {
    ref: 'Doctor',
    foreignField: 'user',
    localField: '_id',
});

userSchema.pre<Query<UserDocument | UserDocument[], UserDocument>>(
    /^find/,
    async function (next) {
        this.find({ isDelete: { $ne: true } });

        next();
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordModified = new Date();

    next();
});

userSchema.methods.checkPasswordModified = function (jwtIat: number) {
    if (this.passwordModified) {
        return (
            parseInt((this.passwordModified.getTime() / 1000).toString()) >
            jwtIat
        );
    }

    return false;
};

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
