export const ASSET_STATUSES = [
    'Operational',
    'Issue Reported',
    'Under Inspection',
    'Under Maintenance',
    'Out of Service',
    'Retired',
]

export const ASSET_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export const ISSUE_STATUSES = [
    'Reported',
    'Assigned',
    'Inspection Started',
    'Maintenance In Progress',
    'Waiting for Parts',
    'Resolved',
    'Closed',
    'Reopened',
]

export const ROLES = ['superadmin', 'technician', 'user']

export const ISSUE_STATUS_FLOW = {
    Reported: ['Assigned', 'Closed'],
    Assigned: ['Inspection Started', 'Reported'],
    'Inspection Started': ['Maintenance In Progress', 'Waiting for Parts'],
    'Maintenance In Progress': ['Waiting for Parts', 'Resolved'],
    'Waiting for Parts': ['Maintenance In Progress'],
    Resolved: ['Closed', 'Reopened'],
    Closed: ['Reopened'],
    Reopened: ['Assigned', 'Inspection Started'],
}

export const ASSET_STATUS_COLORS = {
    Operational: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Issue Reported': 'bg-amber-100 text-amber-700 border-amber-200',
    'Under Inspection': 'bg-blue-100 text-blue-700 border-blue-200',
    'Under Maintenance': 'bg-orange-100 text-orange-700 border-orange-200',
    'Out of Service': 'bg-red-100 text-red-700 border-red-200',
    Retired: 'bg-gray-200 text-gray-600 border-gray-300',
}

export const ISSUE_STATUS_COLORS = {
    Reported: 'bg-amber-100 text-amber-700 border-amber-200',
    Assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    'Inspection Started': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Maintenance In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
    'Waiting for Parts': 'bg-purple-100 text-purple-700 border-purple-200',
    Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Closed: 'bg-gray-200 text-gray-600 border-gray-300',
    Reopened: 'bg-red-100 text-red-700 border-red-200',
}

export const PRIORITY_COLORS = {
    Low: 'bg-gray-100 text-gray-600 border-gray-200',
    Medium: 'bg-blue-100 text-blue-700 border-blue-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Critical: 'bg-red-100 text-red-700 border-red-200',
}