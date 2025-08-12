class PolicyRule:
    def __init__(self, action, resource_type, condition_func, effect="allow"):
        if effect not in ["allow", "deny"]:
            raise ValueError(f"Invalid effect: {effect}")
        if not callable(condition_func):
            raise ValueError("condition_func must be callable")
        
        self.action = action
        self.resource_type = resource_type
        self.condition_func = condition_func
        self.effect = effect
    
    def evaluate(self, user, action, resource):
        if self.action != action or not isinstance(resource, self.resource_type):
            return None
        
        return self.condition_func(user, resource)

