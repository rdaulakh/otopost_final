import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Shield, MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Modal from './ui/Modal';
import InviteMemberForm from './InviteMemberForm';

const TeamManagement = ({ isDarkMode = false }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteMember = (newMember) => {
    console.log('Inviting new member:', newMember);
    // In a real implementation, you would call an API to invite the member
    setIsInviteModalOpen(false);
  };

  const teamMembers = [
    { id: 1, name: 'Admin User', email: 'admin@aisocialmedia.com', role: 'Super Admin', status: 'Active', lastActive: '2 hours ago' },
    { id: 2, name: 'Jane Doe', email: 'jane.doe@aisocialmedia.com', role: 'Admin', status: 'Active', lastActive: '1 day ago' },
    { id: 3, name: 'John Smith', email: 'john.smith@aisocialmedia.com', role: 'Support Manager', status: 'Active', lastActive: '3 hours ago' },
    { id: 4, name: 'Emily White', email: 'emily.white@aisocialmedia.com', role: 'Financial Manager', status: 'Inactive', lastActive: '2 weeks ago' },
  ];

  const getRoleColor = (role) => {
    const colors = {
      'Super Admin': isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800',
      'Admin': isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800',
      'Support Manager': isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800',
      'Financial Manager': isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800');
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team Management</h1>
          <Button onClick={() => setIsInviteModalOpen(true)} className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite Team Member
          </Button>
        </div>

        <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Team Members</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Manage your team members and their roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Name</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Role</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Last Active</th>
                    <th className={`text-left p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className={`border-b transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-slate-800/50' 
                        : 'hover:bg-gray-50'
                    }`}>
                      <td className="p-4">
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={getRoleColor(member.role)}>
                          <Shield className="mr-1 h-3 w-3" />
                          {member.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </td>
                      <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.lastActive}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite New Team Member" isDarkMode={isDarkMode}>
        <InviteMemberForm onInvite={handleInviteMember} onCancel={() => setIsInviteModalOpen(false)} isDarkMode={isDarkMode} />
      </Modal>
    </>
  );
};

export default TeamManagement;


