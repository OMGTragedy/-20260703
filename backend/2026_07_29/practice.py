import gradio as gr

with gr.Blocks() as demo:
    name = gr.Textbox(label="你的名子")