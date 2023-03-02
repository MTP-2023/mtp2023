# mtp2023
Make sure to install Build Tools for Visual Studio from https://visualstudio.microsoft.com/de/downloads/.

Scroll down to "Tools für Visual Studio" -> "Buildtools für Visual Studio 2022".

In the installer, select only the C++ Package.

Create a virtual environment using Anaconda and use "conda install swig" (It is important to do this before installing the rest of the requirements.)

Then, install the remaining required packages using "pip install -r requirements.txt". If you receive an error concerning "mucojo", you can ignore it.