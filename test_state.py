from typing import TypedDict, Annotated, List
import operator
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class AgentState(TypedDict):
    messages: Annotated[List[str], operator.add]
    final_answer: str

def node1(state: AgentState):
    return {"final_answer": "Hello from Node 1", "messages": ["Msg 1"]}

def node2(state: AgentState):
    # Returns the full state exactly as received
    return state

workflow = StateGraph(AgentState)
workflow.add_node("n1", node1)
workflow.add_node("n2", node2)
workflow.set_entry_point("n1")
workflow.add_edge("n1", "n2")
workflow.add_edge("n2", END)

app = workflow.compile(checkpointer=MemorySaver())

config = {"configurable": {"thread_id": "1"}}

# Run 1
out1 = app.invoke({"messages": ["Start1"], "final_answer": ""}, config=config)
print("Run 1 Output:", out1)

# Run 2
out2 = app.invoke({"messages": ["Start2"], "final_answer": ""}, config=config)
print("Run 2 Output:", out2)
