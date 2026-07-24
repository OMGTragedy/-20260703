import gradio as gr

def greet(name,intensity):
    return"Hello," + name + "!" * (intensity)

#建立interface實體
demo = gr.Interface(
    fn = greet,
    inputs = ["text","slider"],
    outputs = ["text"],
    examples=[["菜市場",2], ["菜xx",1]]
)

demo.launch()


