import { model, Schema, Types } from "mongoose";


interface ILike {
    orgId : Types.ObjectId;
    blogId : Types.ObjectId;
    userId : Types.ObjectId;
    isRemoved?: boolean;
}

export const LikeSchema = new Schema<ILike>({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isRemoved: {
        type: Boolean,
        default: false,
    },
});


export const Like = model<ILike>("Like", LikeSchema);