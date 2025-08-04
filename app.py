import streamlit as st
import pandas as pd
import matplotlib as mp

#import 
#global variable
url="https://youtu.be/j_7vD7YV-pg?si=AB92tpGTNumpMnDM"
#data app
df=pd.read_csv('./data/data.csv')

#html variable
html='''
<html>
   <head>
     <title>Thid HTML App</title>
    </head>
    <body>
      <h2> This Long Text!!</h2>
      <br>
      <br>
      <h3> This small Text</h3>
    </body>
</html>
'''

st.title('This is my first webapp!!')

col1,col2=st.columns((4,1))
with col1:
    with st.expander('content1...'):
         st.subheader('content1...')
         st.video(url)
    with st.expander('content2...'):
         st.subheader('content2...')
    
    with st.expander('content2_image...'):
          st.subheader('content2_image...')
          st.image('./image/cat dog.jpg')
          st.write('<h1>this is new title<h1>',unsafe_allow_html=True)

with col2:
    with st.expander('tips...'):
         st.subheader('tips...')