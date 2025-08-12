from .policies.circle_policies import CIRCLE_RULES
from ...exceptions import AccessDenied
from .conditions.relationship_conditions import is_creator, is_member

class PolicyEngine:
    def __init__(self):
        self.rules = []
        self._load_rules()
    
    def _load_rules(self):
        self.rules = CIRCLE_RULES
    
    def _find_applicable_rules(self, action, resource):
        applicable = []
        for rule in self.rules:
            if rule.action == action and isinstance(resource, rule.resource_type):
                applicable.append(rule)
        
        return applicable
            
    
    def authorize(self, user, action, resource):
        
        applicable_rules = self._find_applicable_rules(action, resource)
        
        for rule in applicable_rules:
            if rule.effect == "deny":
                if rule.evaluate(user, action, resource):
                    return False
        
        for rule in applicable_rules:
            if rule.effect == "allow":
                if rule.evaluate(user, action, resource):
                    return True
        
        return False
    
    
    def require_authorization(self, user, action, resource):
        if not self.authorize(user, action, resource):
            raise AccessDenied()


policy_engine = PolicyEngine()
            