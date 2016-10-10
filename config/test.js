module.exports = {
  "port": 3000,
  "servers": [
    {
      "name": "test",
      "commands": [
        {
          "name": "test",
          "run": "echo $test"
        },
        {
          "name": "restart ast",
          "run": "echo $run"
        }
      ]
    },
    {
      "name": "test2",
      "commands": [
        {
          "name": "test2",
          "run": "echo $test2"
        },
        {
          "name": "restart2",
          "run": "echo $run"
        }
      ]
    }
  ],
  "users": [
    {
      "name": "test",
      "password": "password"
    }
  ]
};