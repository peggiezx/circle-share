from ..models.policy_rule import PolicyRule
from ....models import Circle
from ..conditions.relationship_conditions import is_creator, is_member, is_member_but_not_creator

# Rule 1: Only creators can invite
creator_can_invite = PolicyRule(
    action="invite_members",
    resource_type=Circle,
    condition_func=is_creator,
    effect="allow"
)

# Rule 2: Only creators can remove members
creator_can_remove = PolicyRule(
    action="remove_member",
    resource_type=Circle,
    condition_func=is_creator,
    effect="allow"
)

# Rule 3: Only creators can delete circles
creator_can_delete = PolicyRule(
    action="delete_circle",
    resource_type=Circle,
    condition_func=is_creator,
    effect="allow"
)

# Rule 4: Members can leave circles
member_can_leave = PolicyRule(
    action="leave_circle",
    resource_type=Circle,
    condition_func=is_member,
    effect="allow"
)

# Export all rules
CIRCLE_RULES = [
    creator_can_invite,
    creator_can_remove,
    creator_can_delete,
    member_can_leave
]