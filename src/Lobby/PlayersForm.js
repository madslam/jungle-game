import React, {useState, Fragment} from 'react';
import {DownOutlined, UpOutlined, MehOutlined} from '@ant-design/icons';

const buttons = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const PlayersForm = ({value, setValue}) => {
  const [active, setActive] = useState (false);
  return (
    <Fragment>

      <div class="flex flex-col mb-4">
        <button
          onClick={() => setActive (!active)}
          class="border border-gray-50 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-gray-800 focus:outline-none focus:shadow-outline"
        >
          <div class="relative">

            {value}

            <div class="absolute flex border border-transparent inset-y-0 right-0 h-full w-10">
              <div class="flex items-center justify-center rounded-tl rounded-bl z-10 h-full w-full">
                {active ? <UpOutlined /> : <DownOutlined />}
              </div>
            </div>
          </div>
        </button>

      </div>
      {active &&
        <div class="mx-9 my-6 grid grid-cols-3  md:grid-cols-3  gap-1">
          {buttons.map (val => {
            const color = value === val ? 'blue' : 'green';
            return (
              <div class="flex justify-center">
                <button
                  class={`text-${color}-100 bg-transparent border border-solid border-${color}-500 hover:bg-${color}-500 hover:text-white active:bg-${color}-600 font-bold w-full h-16 rounded outline-none focus:outline-none`}
                  type="button"
                  onClick={() => {
                    setValue (val);
                    setActive (false);
                  }}
                  style={{transition: 'all .15s ease'}}
                >
                  {val}
                </button>
              </div>
            );
          })}
        </div>}
    </Fragment>
  );
};

export default PlayersForm;
