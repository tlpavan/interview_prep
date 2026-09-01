"""
DSA Code Evaluator Service
Evaluates coding solutions for correctness, time/space complexity, and code quality
"""

import ast
import re
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

def analyze_complexity(code: str) -> Dict[str, Any]:
    """
    Analyze time and space complexity of code
    Returns estimated complexity class and explanation
    """
    try:
        tree = ast.parse(code)
        
        # Look for common patterns
        has_nested_loops = False
        has_recursion = False
        loop_depth = 0
        max_loop_depth = 0
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.For, ast.While)):
                loop_depth += 1
                max_loop_depth = max(max_loop_depth, loop_depth)
            elif isinstance(node, ast.FunctionDef):
                # Check for recursion
                for child in ast.walk(node):
                    if isinstance(child, ast.Call):
                        if isinstance(child.func, ast.Name) and child.func.id == node.name:
                            has_recursion = True
        
        # Determine complexity
        if max_loop_depth == 0 and not has_recursion:
            time_complexity = "O(1)"
        elif max_loop_depth == 1:
            time_complexity = "O(n)"
        elif max_loop_depth == 2:
            time_complexity = "O(n²)"
        elif has_recursion:
            time_complexity = "O(n log n) or higher (recursive)"
        else:
            time_complexity = "O(n)"
        
        space_complexity = "O(1)" if max_loop_depth < 2 else "O(n)"
        
        return {
            'time_complexity': time_complexity,
            'space_complexity': space_complexity,
            'nested_loops': max_loop_depth,
            'has_recursion': has_recursion
        }
        
    except Exception as e:
        logger.warning(f"Complexity analysis error: {str(e)}")
        return {
            'time_complexity': 'Unknown',
            'space_complexity': 'Unknown',
            'nested_loops': 0,
            'has_recursion': False
        }

def check_code_quality(code: str) -> Dict[str, Any]:
    """
    Check code quality: readability, variable names, comments
    """
    issues = []
    suggestions = []
    
    # Check for meaningful variable names
    lines = code.split('\n')
    var_pattern = re.compile(r'\b([a-z])\b')  # Single letter vars
    single_letter_vars = var_pattern.findall(code)
    if len(single_letter_vars) > 5:
        suggestions.append("Use more descriptive variable names instead of single letters")
    
    # Check for comments
    comment_lines = sum(1 for line in lines if line.strip().startswith('#'))
    if comment_lines == 0 and len(lines) > 10:
        suggestions.append("Add comments to explain complex logic")
    
    # Check for docstring
    if '"""' not in code and "'''" not in code:
        suggestions.append("Add docstring to function")
    
    # Check for error handling
    if 'try' not in code and 'except' not in code:
        suggestions.append("Consider adding error handling for edge cases")
    
    return {
        'issues': issues,
        'suggestions': suggestions,
        'code_length': len(code),
        'line_count': len(lines)
    }

def execute_test_cases(code: str, test_cases: List[Dict]) -> Dict[str, Any]:
    """
    Execute code against test cases
    Returns pass/fail status
    """
    passed = 0
    failed = 0
    errors = []
    
    if not test_cases:
        return {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'pass_rate': 0,
            'errors': []
        }
    
    try:
        # Create execution namespace
        namespace = {}
        exec(code, namespace)
        
        # Find the main function (usually the first function or named 'solution')
        main_func = None
        if 'solution' in namespace:
            main_func = namespace['solution']
        else:
            for name, obj in namespace.items():
                if callable(obj) and not name.startswith('_'):
                    main_func = obj
                    break
        
        if not main_func:
            return {
                'total': len(test_cases),
                'passed': 0,
                'failed': len(test_cases),
                'pass_rate': 0,
                'errors': ['No callable function found']
            }
        
        # Run test cases
        for i, test in enumerate(test_cases):
            try:
                inputs = test.get('input', [])
                expected = test.get('expected')
                
                if isinstance(inputs, list):
                    result = main_func(*inputs)
                else:
                    result = main_func(inputs)
                
                if result == expected:
                    passed += 1
                else:
                    failed += 1
                    errors.append(f"Test {i+1}: Expected {expected}, got {result}")
            except Exception as e:
                failed += 1
                errors.append(f"Test {i+1} error: {str(e)}")
        
    except SyntaxError as e:
        return {
            'total': len(test_cases),
            'passed': 0,
            'failed': len(test_cases),
            'pass_rate': 0,
            'errors': [f'Syntax error: {str(e)}']
        }
    except Exception as e:
        return {
            'total': len(test_cases),
            'passed': 0,
            'failed': len(test_cases),
            'pass_rate': 0,
            'errors': [f'Execution error: {str(e)}']
        }
    
    total = passed + failed
    pass_rate = (passed / total * 100) if total > 0 else 0
    
    return {
        'total': total,
        'passed': passed,
        'failed': failed,
        'pass_rate': round(pass_rate, 2),
        'errors': errors
    }

def evaluate_code(code: str, problem: str = "", test_cases: List[Dict] = None) -> Dict[str, Any]:
    """
    Main function to evaluate code
    Returns comprehensive evaluation report
    """
    if test_cases is None:
        test_cases = []
    
    logger.info(f"📝 Evaluating code ({len(code)} chars, {len(test_cases)} tests)")
    
    # Syntax check
    try:
        ast.parse(code)
        syntax_valid = True
        syntax_error = None
    except SyntaxError as e:
        syntax_valid = False
        syntax_error = str(e)
    
    if not syntax_valid:
        return {
            'is_valid': False,
            'verdict': 'Syntax Error',
            'syntax_error': syntax_error,
            'score': 0,
            'complexity': None,
            'quality': None,
            'test_results': None
        }
    
    # Complexity analysis
    complexity = analyze_complexity(code)
    
    # Code quality check
    quality = check_code_quality(code)
    
    # Test execution
    test_results = execute_test_cases(code, test_cases)
    
    # Determine verdict
    if test_results['pass_rate'] == 100:
        verdict = "Accepted ✓"
        score = 95
    elif test_results['pass_rate'] >= 50:
        verdict = "Partial Correct"
        score = 60
    elif test_results['passed'] > 0:
        verdict = "Partially Accepted"
        score = 40
    else:
        verdict = "Wrong Answer"
        score = 20
    
    # Adjust score based on complexity and quality
    if complexity['time_complexity'] in ['O(1)', 'O(n)', 'O(n log n)']:
        score += 5
    if len(quality['suggestions']) < 2:
        score += 5
    
    score = min(100, score)
    
    return {
        'is_valid': True,
        'verdict': verdict,
        'score': score,
        'complexity': complexity,
        'quality': quality,
        'test_results': test_results,
        'timestamp': str(__import__('datetime').datetime.now())
    }
