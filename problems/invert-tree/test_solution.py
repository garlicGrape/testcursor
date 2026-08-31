from solution import TreeNode, invert_tree


def test_invert():
    root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7, TreeNode(6), TreeNode(9)))
    out = invert_tree(root)
    assert out.val == 4
    assert out.left.val == 7
    assert out.right.val == 2
    assert out.left.left.val == 9
    assert out.right.right.val == 1


def test_empty():
    assert invert_tree(None) is None
