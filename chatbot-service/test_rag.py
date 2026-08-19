import sys
import traceback

def test():
    try:
        from main import _answer_with_rag
        res = _answer_with_rag("hi")
        print("Success:", res)
    except Exception as e:
        print("Failed!")
        traceback.print_exc()

if __name__ == "__main__":
    test()
