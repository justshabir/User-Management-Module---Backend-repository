import mongoose from "mongoose"

const { Schema } = mongoose;

const ReferralSchema = new Schema({
  referralId: {
    type: String,
    unique: true
  },
  referralLink: {
    type: String,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },

  createdAt: {
    type: Date,
    default: Date.now()
  }
}, 
{
    timestamps: true,
  }
)

export default mongoose.model('referral', ReferralSchema);