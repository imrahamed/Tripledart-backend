import { Request, Response, NextFunction } from 'express';
import Workspace, { IWorkspace, IWorkspaceMember } from '../../core/models/workspace.model';
import { UserModel } from '../../core/models/user.model';
import { ApiError } from '../../utils/apiError';
import mongoose from 'mongoose';

// Helper to transform MongoDB document to frontend model
const transformWorkspace = (workspace: IWorkspace) => {
  const result = workspace.toObject();
  result.id = result._id.toString();
  delete result._id;
  
  // Convert member user IDs to strings
  if (result.members && result.members.length > 0) {
    result.members.forEach((member: any) => {
      if (member.userId && typeof member.userId === 'object') {
        member.id = String(member._id || '');
        member.userId = String(member.userId);
      }
    });
  }
  
  return result;
};

export const getWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    if (!userId) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    // Find workspaces where user is either the owner or a member
    const workspaces = await Workspace.find({ 
      $or: [
        { ownerId: userId },
        { 'members.userId': userId }
      ]
    });
    
    const transformedWorkspaces = workspaces.map(transformWorkspace);
    
    res.status(200).json({ success: true, data: transformedWorkspaces });
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    if (!userId) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    // Find workspace where user is either the owner or a member
    const workspace = await Workspace.findOne({ 
      _id: id,
      $or: [
        { ownerId: userId },
        { 'members.userId': userId }
      ]
    });
    
    if (!workspace) {
      return next(new ApiError(404, 'Workspace not found'));
    }

    res.status(200).json({ success: true, data: transformWorkspace(workspace) });
  } catch (error) {
    next(error);
  }
};

export const createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, members } = req.body;
    const userId = (req as any).user.id;
    
    if (!userId) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    if (!name) {
      return next(new ApiError(400, 'Workspace name is required'));
    }

    // Create the workspace
    const workspace = await Workspace.create({
      name,
      description,
      ownerId: userId,
      members: [], // Initial members will be added by pre-save hook
      memberCount: members?.length ? members.length + 1 : 1 // +1 for owner
    });

    // Add additional members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      // Process each member from the request
      const validMembers = members.filter(m => m.userId && m.userId !== userId); // Filter out owner
      
      if (validMembers.length > 0) {
        const addedMembers: IWorkspaceMember[] = validMembers.map(member => ({
          userId: member.userId,
          role: member.role || 'member',
          name: member.name,
          email: member.email,
          avatarUrl: member.avatarUrl,
          initial: member.initial,
          joinedAt: new Date()
        }));
        
        // Update the workspace with the additional members
        workspace.members.push(...addedMembers);
        workspace.memberCount = workspace.members.length;
        await workspace.save();
      }
    }

    res.status(201).json({ success: true, data: transformWorkspace(workspace) });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;
    const userId = (req as any).user.id;
    
    if (!userId) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    // Only workspace owner can update it
    const workspace = await Workspace.findOne({ _id: id, ownerId: userId });
    
    if (!workspace) {
      return next(new ApiError(404, 'Workspace not found or you do not have permission to update it'));
    }

    // Create update object with basic fields
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    // If members are provided, update them
    if (members && Array.isArray(members)) {
      // Always keep the owner as a member
      const ownerMember = workspace.members.find(m => 
        m.userId.toString() === userId && m.role === 'owner'
      );
      
      // Process new members
      const newMembers = members.map(member => ({
        userId: member.userId,
        role: member.role || 'member',
        name: member.name,
        email: member.email,
        avatarUrl: member.avatarUrl,
        initial: member.initial,
        joinedAt: member.joinedAt || new Date()
      }));
      
      // Ensure owner is still a member with owner role
      if (ownerMember && !newMembers.some(m => m.userId === userId)) {
        newMembers.push({
          userId: ownerMember.userId,
          role: ownerMember.role,
          name: ownerMember.name || '',
          email: ownerMember.email || '',
          avatarUrl: ownerMember.avatarUrl || '',
          initial: ownerMember.initial || '',
          joinedAt: ownerMember.joinedAt
        });
      }
      
      updateData.members = newMembers;
      updateData.memberCount = newMembers.length;
    }

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedWorkspace) {
      return next(new ApiError(404, 'Failed to update workspace'));
    }

    res.status(200).json({ success: true, data: transformWorkspace(updatedWorkspace) });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    if (!userId) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    // Only workspace owner can delete it
    const workspace = await Workspace.findOne({ _id: id, ownerId: userId });
    
    if (!workspace) {
      return next(new ApiError(404, 'Workspace not found or you do not have permission to delete it'));
    }

    await Workspace.findByIdAndDelete(id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Add a new member to a workspace
export const addWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const currentUserId = (req as any).user.id;
    
    if (!currentUserId) {
      return next(new ApiError(401, 'Unauthorized'));
    }
    
    if (!email) {
      return next(new ApiError(400, 'Email is required'));
    }

    // Only workspace owner or admin can add members
    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { ownerId: currentUserId },
        { members: { $elemMatch: { userId: currentUserId, role: { $in: ['owner', 'admin'] } } } }
      ]
    });
    
    if (!workspace) {
      return next(new ApiError(404, 'Workspace not found or you do not have permission to add members'));
    }

    // Find or create user by email
    let user = await UserModel.findOne({ email });
    
    if (!user) {
      // Create a new user with minimal information
      const username = email.split('@')[0];
      user = await UserModel.create({
        email,
        name: username,
        password: Math.random().toString(36).slice(-8), // Temporary password
        role: 'brand' // Default role
      });
    }
    
    // Check if user is already a member
    if (workspace.members.some(m => m.userId.toString() === user._id.toString())) {
      return next(new ApiError(400, 'User is already a member of this workspace'));
    }
    
    // Add the new member
    workspace.members.push({
      userId: user._id,
      role: role || 'member',
      name: user.name,
      email: user.email,
      initial: user.name[0].toUpperCase(),
      joinedAt: new Date()
    });
    
    workspace.memberCount = workspace.members.length;
    await workspace.save();
    
    res.status(200).json({ success: true, data: transformWorkspace(workspace) });
  } catch (error) {
    next(error);
  }
};

// Remove a member from a workspace
export const removeWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, memberId } = req.params;
    const currentUserId = (req as any).user.id;
    
    if (!currentUserId) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    // Only workspace owner or admin can remove members
    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { ownerId: currentUserId },
        { members: { $elemMatch: { userId: currentUserId, role: { $in: ['owner', 'admin'] } } } }
      ]
    });
    
    if (!workspace) {
      return next(new ApiError(404, 'Workspace not found or you do not have permission to remove members'));
    }
    
    // Cannot remove the owner
    if (workspace.ownerId.toString() === memberId) {
      return next(new ApiError(400, 'Cannot remove the workspace owner'));
    }
    
    // Remove the member
    const initialLength = workspace.members.length;
    workspace.members = workspace.members.filter(m => m.userId.toString() !== memberId);
    
    // If no member was removed
    if (workspace.members.length === initialLength) {
      return next(new ApiError(404, 'Member not found in this workspace'));
    }
    
    workspace.memberCount = workspace.members.length;
    await workspace.save();
    
    res.status(200).json({ success: true, data: transformWorkspace(workspace) });
  } catch (error) {
    next(error);
  }
}; 