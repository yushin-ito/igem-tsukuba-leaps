## Welcome to LEAPS
LEAPS is an interactive web application designed to enable the design of high-performance protein sequences, even from a small number of experimental data points. It provides a simple and intuitive interface that anyone can use without difficulty. The workflow proceeds through the following steps:

### Step 1: Upload Your Dataset
Upload a CSV file containing protein sequences and multiple experimental values for each sequence.

### Step 2: Generate Sample Sequences
Based on the uploaded sequences, a large number of new sequences will be generated using methods such as shuffling or random mutations.

### Step 3: Train Predictive Models
For each experimental value, a predictive model will be trained.

### Step 4: Screening
Generated sequences will be evaluated using predicted values from the models and likelihoods from the generative model. Sequences will then be filtered based on user-defined thresholds.

### Step 5: Fine-tune the Generative Model
Using the high-quality sequences selected through screening, the generative model will be fine-tuned.

By repeating these steps, the system aims to generate optimal protein sequences tailored to your specific objectives.

**Shall we get started?**