
import React, { useState, useEffect } from 'react';
import { Plus, Users, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdAt: string;
}

interface GroupsProps {
  onGroupSelect: (group: Group | null) => void;
  selectedGroup: Group | null;
}

const Groups: React.FC<GroupsProps> = ({ onGroupSelect, selectedGroup }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [newGroupForm, setNewGroupForm] = useState({ name: '', description: '' });
  const [newMemberName, setNewMemberName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load groups from localStorage on component mount
  useEffect(() => {
    const loadGroups = () => {
      try {
        setIsLoading(true);
        const storedGroups = localStorage.getItem('groups');
        if (storedGroups) {
          const parsedGroups = JSON.parse(storedGroups);
          setGroups(parsedGroups);
        }
      } catch (error) {
        console.error('Error loading groups from localStorage:', error);
        toast({
          title: 'Error',
          description: 'Failed to load groups from storage',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, [toast]);

  // Save groups to localStorage whenever groups change
  const saveGroups = (updatedGroups: Group[]) => {
    try {
      localStorage.setItem('groups', JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
    } catch (error) {
      console.error('Error saving groups to localStorage:', error);
      toast({
        title: 'Error',
        description: 'Failed to save groups',
        variant: 'destructive',
      });
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return;

    try {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: newGroupForm.name.trim(),
        description: newGroupForm.description.trim(),
        members: [],
        createdAt: new Date().toISOString(),
      };

      const updatedGroups = [...groups, newGroup];
      saveGroups(updatedGroups);
      
      setNewGroupForm({ name: '', description: '' });
      setShowCreateForm(false);

      toast({
        title: 'Group Created!',
        description: `Created group "${newGroup.name}"`,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
    }
  };

  const addMember = async (groupId: string) => {
    if (!newMemberName.trim()) return;

    const memberUsername = newMemberName.trim();

    try {
      const updatedGroups = groups.map((group) => {
        if (group.id === groupId) {
          if (!group.members.includes(memberUsername)) {
            return { ...group, members: [...group.members, memberUsername] };
          }
        }
        return group;
      });

      saveGroups(updatedGroups);
      setNewMemberName('');
      setShowAddMember(null);

      toast({
        title: 'Member Added!',
        description: `Added ${memberUsername} to the group`,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    }
  };

  const removeMember = async (groupId: string, memberUsername: string) => {
    try {
      const updatedGroups = groups.map((group) => {
        if (group.id === groupId) {
          return { ...group, members: group.members.filter(m => m !== memberUsername) };
        }
        return group;
      });

      saveGroups(updatedGroups);

      toast({
        title: 'Member Removed',
        description: `Removed ${memberUsername} from the group`,
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      const groupToDelete = groups.find(g => g.id === groupId);
      const updatedGroups = groups.filter((group) => group.id !== groupId);
      saveGroups(updatedGroups);

      if (selectedGroup?.id === groupId) {
        onGroupSelect(null);
      }

      toast({
        title: 'Group Deleted',
        description: `Deleted group "${groupToDelete?.name || 'Unknown'}"`,
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Groups</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading groups...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Groups</h2>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No groups yet</h3>
            <p className="text-gray-500 mb-4">Create your first group to start splitting expenses with friends</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                selectedGroup?.id === group.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => onGroupSelect(group)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                      {group.name}
                    </CardTitle>
                    {group.description && (
                      <p className="text-sm text-gray-600">{group.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(group.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Members ({group.members.length})</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMember(group.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {group.members.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No members yet</p>
                    ) : (
                      group.members.map((member, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-700">{member}</span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMember(group.id, member);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Created: {new Date(group.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={createGroup} className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupForm.name}
                onChange={(e) => setNewGroupForm({...newGroupForm, name: e.target.value})}
                placeholder="e.g., Weekend Trip, Roommates"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="groupDescription">Description (Optional)</Label>
              <Input
                id="groupDescription"
                value={newGroupForm.description}
                onChange={(e) => setNewGroupForm({...newGroupForm, description: e.target.value})}
                placeholder="Brief description of the group"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Create Group
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={!!showAddMember} onOpenChange={() => setShowAddMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (showAddMember) addMember(showAddMember);
          }} className="space-y-4">
            <div>
              <Label htmlFor="memberName">Member Username</Label>
              <Input
                id="memberName"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter username"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Add members by their username, not email
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                Add Member
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddMember(null)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
