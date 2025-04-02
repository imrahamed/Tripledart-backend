import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  name?: string;
  email?: string;
  avatarUrl?: string;
  initial?: string;
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  ownerId: string;
  members: IWorkspaceMember[];
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  },
  name: String,
  email: String,
  avatarUrl: String,
  initial: String,
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const WorkspaceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: {
      type: [WorkspaceMemberSchema],
      default: []
    },
    memberCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Add a pre-save hook to automatically add the owner as a member
WorkspaceSchema.pre('save', function(next) {
  const workspace = this as IWorkspace;
  
  // If this is a new workspace, add the owner as a member
  if (this.isNew && workspace.members.length === 0) {
    workspace.members.push({
      userId: workspace.ownerId,
      role: 'owner',
      joinedAt: new Date()
    });
    workspace.memberCount = 1;
  }
  
  next();
});

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema); 